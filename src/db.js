import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const sql_db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

sql_db.connect((err) => {
  if (err) {
    console.error("ERROR CONNECTING TO THE DATABASE:", err.stack);
    return;
  }

  console.log(
    "CONNECTED TO THE MYSQL DATABASE:",
    process.env.DB_NAME,
    "NETWORK",
    sql_db.threadId
  );

  // Execute your queries here
  sql_db.query(
    `CREATE DATABASE IF NOT EXISTS job_db;`,
    (err, result) => {
      if (err) {
        console.error("ERROR CREATING DATABASE:", err);
        return;
      }
      // console.log("Database 'job_finding_db' created successfully");

      // Switch to the newly created database
      sql_db.changeUser({ database: "job_db" }, (err) => {
        if (err) {
          console.error("ERROR SWITCHING DATABASE:", err);
          return;
        }

        // Create the 'users' table
        sql_db.query(
          `CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          email VARCHAR(255) NULL,
          phone VARCHAR(20) NULL,
          password VARCHAR(255) NOT NULL,
          userType ENUM('jobSeeker', 'employer') NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
          (err, result) => {
            if (err) {
              console.error("ERROR CREATING TABLE 'users':", err);
              return;
            }
            // console.log("Table 'users' created successfully");
          }
        );

        // Create the 'job_postings' table
        sql_db.query(
          `CREATE TABLE IF NOT EXISTS job_postings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          requirements TEXT,
          salary VARCHAR(20),
          location VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
          (err, result) => {
            if (err) {
              console.error("ERROR CREATING TABLE 'job_postings':", err);
              return;
            }
            // console.log("Table 'job_postings' created successfully");
          }
        );
      });
    }
  );
});

export { sql_db };

// import mysql from "mysql2";
// import dotenv from "dotenv";

// dotenv.config();

// const sql_db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// sql_db.connect((err) => {
//   if (err) {
//     console.error("ERROR CONNECTING TO THE DATABASE:", err.stack);
//     return;
//   }

//   console.log(
//     "CONNECTED TO THE MYSQL DATABASE:",
//     process.env.DB_NAME,
//     "NETWORK",
//     sql_db.threadId
//   );

//   // Execute your queries here
//   sql_db.query(
//     `CREATE DATABASE IF NOT EXISTS job_finding_db;`,
//     (err, result) => {
//       if (err) {
//         console.error("ERROR CREATING DATABASE:", err);
//         return;
//       }
//       // console.log("Database 'job_finding_db' created successfully");

//       // Switch to the newly created database
//       sql_db.changeUser({ database: "job_finding_db" }, (err) => {
//         if (err) {
//           console.error("ERROR SWITCHING DATABASE:", err);
//           return;
//         }

//         // Create the 'users' table
//         sql_db.query(
//           `CREATE TABLE IF NOT EXISTS users (
//           id INT AUTO_INCREMENT PRIMARY KEY,
//           username VARCHAR(255) NOT NULL,
//           password VARCHAR(255) NOT NULL,
//           userType ENUM('jobSeeker', 'employer') NOT NULL,

//         )`,
//           (err, result) => {
//             if (err) {
//               console.error("ERROR CREATING TABLE 'users':", err);
//               return;
//             }
//             // console.log("Table 'users' created successfully");
//           }
//         );

//         // Create the 'users' table
//         sql_db.query(
//           `CREATE TABLE IF NOT EXISTS jobs_posting (
//               id INT AUTO_INCREMENT PRIMARY KEY,
//               title VARCHAR(255) NOT NULL,
//               description VARCHAR(255) ,
//               requirements VARCHAR(255),
//               salary VARCHAR(20),
//               location VARCHAR(100),
//               remarks VARCHAR(255),
//               username VARCHAR(255) NOT NULL,
//               password VARCHAR(255) NOT NULL,
//               userType ENUM('jobSeeker', 'employer') NOT NULL
//         )`,
//           (err, result) => {
//             if (err) {
//               console.error("ERROR CREATING TABLE 'users':", err);
//               return;
//             }
//             // console.log("Table 'jobs_posting' created successfully");
//           }
//         );
//       });
//     }
//   );
// });

// export { sql_db };
