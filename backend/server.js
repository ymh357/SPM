let mysql = require('mysql');
let express = require('express');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let nodemailer = require('nodemailer');
let path = require('path');
let app = express();
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'carwash'
});

const hostport = "localhost:8081";

const companyEmailAddress = 'kunleeee@gmail.com';
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: companyEmailAddress,
        pass: 'Talent520'
    }
});

connection.connect();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname,"../frontend/public")));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../frontend', 'Home.html'));
});
app.get('/Home', function (req, res) {
    res.sendFile(path.join(__dirname, '../frontend', 'Home.html'));
});

app.get('/About', function (req, res) {
    res.sendFile(path.join(__dirname, '../frontend', 'About.html'));
});
app.get('/Plans', function (req, res) {
    res.sendFile(path.join(__dirname, '../frontend', 'Plans.html'));
});
app.get('/Personal', function (req, res) {
    res.sendFile(path.join(__dirname, '../frontend', 'Personal.html'));
});
app.get('/Book', function (req, res) {
    res.sendFile(path.join(__dirname, '../frontend', 'Book.html'));
});
app.get('/Login', function (req, res) {
    res.sendFile(path.join(__dirname, '../frontend', 'Login.html'));
});
app.get('/Register', function (req, res) {
    res.sendFile(path.join(__dirname, '../frontend', 'Register.html'));
});

app.get('/admin', function (req, res) {
    res.sendFile(path.join(__dirname, '../frontend', 'Admin.html'));
});


app.post('/registerHandler', function (req, res) {
    let newUser = req.body;
    let responseJson;

    connection.query(`select * from user where email = "${newUser.email}"`, function (err, results){
       if(err){
           responseJson = {error:err};
           res.json(responseJson);
       }else if(results.length===0){
           let sql = `INSERT INTO user (email, password) VALUES ('${newUser.email}', '${newUser.password}')`;
           connection.query(sql, function (err, result) {
               if(err){
                   responseJson = {error:err};
                   res.json(responseJson);
               }else{
                   res.cookie('email', newUser.email, {maxAge: 60*60*1000});
                   responseJson = {success:"inserted"};
                   res.json(responseJson);
               }
           });
       }else{
           responseJson = {fail:"existed"};
           res.json(responseJson);
       }
    });

});

app.post('/loginHandler', function (req, res) {
    let loginUser = req.body;
    let responseJson;

    connection.query(`select * from user where email = "${loginUser.email}"`, function (err, results){
        if(err){
            responseJson = {error:err};
            res.json(responseJson);
        }else if(results.length===0){
            responseJson = {fail:"No such user."};
            res.json(responseJson);
        }else if(results.length===1){
            connection.query(`select * from user where email = "${loginUser.email}" and password = "${loginUser.password}"`, function (err, result){
                if(err){
                    responseJson = {error:err};
                    res.json(responseJson);
                }else if(result.length === 0){
                    responseJson = {fail:"Wrong Password."};
                    res.json(responseJson);
                }else if(result.length === 1){
                    res.cookie('email', loginUser.email, {maxAge: 60*60*1000});
                    responseJson = {success:"found"};
                    res.json(responseJson);
                }
            });
        }
    });
});

app.post('/checkAdminPassword', function (req, res) {
    let password = req.body.password;
    let responseJson;

    if(password === "+10086"){
        connection.query(`select * from appointment`, function (err, results){
            if(err){
                responseJson = {error:err};
                res.json(responseJson);
            }else {
                responseJson = results;
                res.json(responseJson);
            }
        });

    }else{
        responseJson = {fail: "Wrong password."};
        res.json(responseJson);
    }
});

app.get('/getPersonal', function (req, res) {
    let email = req.cookies["email"];
    let responseJson;
    connection.query(`select * from personal where email = "${email}"`, function (err, results){
        if(err){
            responseJson = {error:err};
            res.json(responseJson);
        }else if(results.length===0){
            responseJson = {nothing:"first"};
            res.json(responseJson);
        }else if(results.length===1){
            let result = results[0];
            responseJson = {email:result.email, name:result.name, address: result.address, mobilephone: result.mobilephone, homephone: result.homephone, workphone: result.workphone, cartype: result.cartype};
            res.json(responseJson);
        }
    });

});

app.post('/updatePersonal',function (req,res) {
    let email = req.cookies["email"];
    let newPersonal = req.body;
    let responseJson;

    connection.query(`select * from personal where email = '${email}'`, function (err, results){
        if(err){
            console.dir(err);
            responseJson = {error: err};
            res.json(responseJson);
        }else if(results.length === 0){
            let sql = `INSERT INTO personal (email, name, address, mobilephone, homephone, workphone, cartype) VALUES ("${email}", "${newPersonal.name}", "${newPersonal.address}", "${newPersonal.mobilephone}", "${newPersonal.homephone}", "${newPersonal.workphone}", "${newPersonal.cartype}")`;
            connection.query(sql, function (err, results){
                if(err){
                    console.dir(err);
                    responseJson = {error: err};
                    res.json(responseJson);
                }else{
                    responseJson = {success: "inserted"};
                    res.json(responseJson);
                }
            });
        }else{
            let sql = `UPDATE personal SET name = '${newPersonal.name}', address = '${newPersonal.address}', mobilephone = '${newPersonal.mobilephone}', homephone = '${newPersonal.homephone}', workphone = '${newPersonal.workphone}', cartype = '${newPersonal.cartype}' WHERE email = '${newPersonal.email}'`;
            connection.query(sql, function (err, results){
                if(err){
                    console.dir(err);
                    responseJson = {error: err};
                    res.json(responseJson);
                }else{
                    responseJson = {success: "updated"};
                    res.json(responseJson);
                }
            });
        }
    });


});

app.post('/makeabook', function (req, res) {
    let email = req.cookies["email"];
    let appointment = req.body;
    let responseJson;

    if(appointment.id){
        let sql = `UPDATE appointment SET email = '${appointment.email}', cartype = '${appointment.cartype}', plantype = '${appointment.plantype}', time = '${appointment.time}', description = '${appointment.description}' WHERE id = '${appointment.id}'`;
        connection.query(sql, function (err, results) {
           if(err){
               responseJson = {error: err};
               res.json(responseJson);
           }else{
               responseJson = {success: "updated"};
               res.json(responseJson);

               let plan = '';
               switch (appointment.plantype) {
                   case 'silver':
                       plan = 'wash outside only $15';
                       break;
                   case 'gold':
                       plan = 'wash inside and outside $25';
                       break;
                   case 'diamond':
                       plan =  "deluxe wash $30 (which is inside and outside and the car is very dirty)";
                       break;
               }

               let suffix = "AM";
               let hours = appointment.time.slice(0,2);
               (parseInt(hours) < 6) && (suffix = "PM");
               let minutes = appointment.time.slice(2);
               let endDate = new Date(new Date(`2017-10-10 ${hours}:${minutes}:00`).getTime() + 40*60*1000);
               let endHours = endDate.getHours();
               endHours.length === 1 && (endHours = '0' + endHours);
               let endMinutes = endDate.getMinutes() + "";
               console.log(endMinutes);
               endMinutes.length === 1 && (endMinutes = '0' + endMinutes);
               console.log(endMinutes);
               let time = `${hours}:${minutes+suffix} - ${endHours}:${endMinutes+suffix}`;
               let html = `
                   <h1>Appointment ID: ${appointment.id} has been rescheduled successfully.</h1>
                   <p>Below is the detail information of the rescheduled appointment.</p>
                <ul>
                    <li>Car Type: ${appointment.cartype}</li>
                    <li>Plan: ${plan}</li>
                    <li>Appointment Time: ${time}</li>
                    <li>Description: ${appointment.description}</li>
                </ul>
                <p>You can either <a href="http://${hostport}/cancelappointment?id=${appointment.id}">cancel</a> the appointment or <a href="http://${hostport}/reschedule?id=${appointment.id}">reschedule</a> it.</p>
               `;

               let mailOptions = {
                   from: companyEmailAddress,
                   to: appointment.email,
                   subject: 'Confirmation email of the rescheduled appointment',
                   html: html
               };

               transporter.sendMail(mailOptions, function(error, info) {
                   if (error) {
                       console.log(error);
                   } else {
                       console.log('Email sent: ' + info.response);
                   }
               });
           }
        });
        return;
    }

    let sql = `INSERT INTO appointment (email, cartype, plantype, time, description) VALUES ("${email}", "${appointment.cartype}", "${appointment.plantype}", "${appointment.time}", "${appointment.description}")`;
    connection.query(sql, function (err, results){
        if(err){
            console.dir(err);
            responseJson = {error: err};
            res.json(responseJson);
        }else{
            responseJson = {success: "inserted"};
            res.json(responseJson);
            ////////////////
            let id = results.insertId;
            let plan = '';
            switch (appointment.plantype) {
                case 'silver':
                    plan = 'wash outside only $15';
                    break;
                case 'gold':
                    plan = 'wash inside and outside $25';
                    break;
                case 'diamond':
                    plan =  "deluxe wash $30 (which is inside and outside and the car is very dirty)";
                    break;
            }

            let suffix = "AM";
            let hours = appointment.time.slice(0,2);
            (parseInt(hours) < 6) && (suffix = "PM");
            let minutes = appointment.time.slice(2);
            let endDate = new Date(new Date(`2017-10-10 ${hours}:${minutes}:00`).getTime() + 40*60*1000);
            let endHours = endDate.getHours();
            endHours.length === 1 && (endHours = '0' + endHours);
            let endMinutes = endDate.getMinutes() + "";
            console.log(endMinutes);
            endMinutes.length === 1 && (endMinutes = '0' + endMinutes);
            console.log(endMinutes);
            let time = `${hours}:${minutes+suffix} - ${endHours}:${endMinutes+suffix}`;
            let html = `
                <h1>Appointment ID: ${id}</h1>
                <p>Congratulations! You just successfully made an appointment for your carwash.Below is the detail information of the booking.</p>
                <ul>
                    <li>Car Type: ${appointment.cartype}</li>
                    <li>Plan: ${plan}</li>
                    <li>Appointment Time: ${time}</li>
                    <li>Description: ${appointment.description}</li>
                </ul>
                <p>You can either <a href="http://${hostport}/cancelappointment?id=${id}">cancel</a> the appointment or <a href="http://${hostport}/reschedule?id=${id}">reschedule</a> it.</p>
            `;
            let mailOptions = {
                from: companyEmailAddress,
                to: email,
                subject: 'Confirmation email of the appointment',
                html: html
            };

            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
    });
});

app.get('/cancelappointment', function (req, res) {
    let id = req.query.id;
    let sql = `select * FROM appointment WHERE id = "${id}"`;
    let email;
    connection.query(sql, function (err, results){
        if(err){
            res.send(`Error happens when cancelling the appointment. Error code: ${err}`);
        }else if( results.length === 0){
            res.send('The appointment ID is not in database.');
        }else{
            email = results[0].email;
            sql = `DELETE FROM appointment WHERE id = ${id}`;
            connection.query(sql, function (err, results){
                if(err){
                    res.send(`Error happens when cancelling the appointment. Error code: ${err}`);
                }else{
                    let html = `
                        <h1>Appointment is successfully cancelled.</h1>
                        <p>If you want to book a new one, click <a href="http://${hostport}/Book">here.</a></p>
                    `;
                    let mailOptions = {
                        from: companyEmailAddress,
                        to: email,
                        subject: 'Confirmation email of the Cancellation for the appointment',
                        html: html
                    };

                    transporter.sendMail(mailOptions, function(error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });

                    res.set('Content-Type', 'text/html');
                    res.send(new Buffer('<h1>Appointment has been Cancelled successfully. </h1>'));
                }
            });
        }
    });

});

app.get('/reschedule', function (req, res) {
    let id = req.query.id;
    res.cookie('id', id, {maxAge: 60*60*1000});
    res.sendFile(path.join(__dirname, '../frontend', 'rebook.html'));
});

app.get('/getAppointment', function (req, res) {
    let id = req.query.id;
    let responseJson;
    connection.query(`select * from appointment where id = "${id}"`, function (err, results){
        if(err){
            responseJson = {error:err};
            res.json(responseJson);
        }else if(results.length===0){
            responseJson = {nothing:"first"};
            res.json(responseJson);
        }else if(results.length===1){
            let result = results[0];
            responseJson = {email:result.email, cartype:result.cartype, plantype: result.plantype, time: result.time, description: result.description};
            res.json(responseJson);
        }
    });
});

let server = app.listen(8081, function () {

});

//connection.end();