// routes/tweets.js
const express=require('express')
const router=express.Router()
const mongoose=require('mongoose')
const Data=mongoose.model("Data")

router.get('/data', async (req, res) => {
  try {
    // Assuming you want to find all documents in the "Data" collection
    const data = await Data.find({});

    // Iterate through the retrieved data and format it as required
    const formattedData = data.map((item) => {
      return {
        _id: item._id,
        'Position ID': item.positionId,
        'Position Status': item.positionStatus,
        Time: item.time,
        'Time Out': item.timeOut,
        'Timecard Hours (as Time)': item.timecardHours,
        'Pay Cycle Start Date': item.payCycleStartDate,
        'Pay Cycle End Date': item.payCycleEndDate,
        'Employee Name': item.employeeName,
        'File Number': item.fileNumber,
      };
    });

    res.status(200).json(formattedData);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/consecutive-employees', async (req, res) => {
  try {
    const data = await Data.find({}).sort({ Date: 1 }); // Sort by date in ascending order

    let consecutiveDays = 1;
    let consecutiveEmployees = [];

    for (let i = 1; i < data.length; i++) {
      const currentDate = new Date(data[i].Date);
      const prevDate = new Date(data[i - 1].Date);
      const timeDifference = currentDate - prevDate;
      const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

      if (timeDifference <= oneDay) {
        consecutiveDays++;
        consecutiveEmployees.push({
          EmployeeName: data[i].EmployeeName,
          Position: data[i].Position,
        });
      } else {
        consecutiveDays = 1;
        consecutiveEmployees = [];
      }

      if (consecutiveDays === 7) {
        // Employee has worked for 7 consecutive days
        // Send the names and positions of these employees as JSON response
        const response = consecutiveEmployees.map((employee) => ({
          Name: employee.EmployeeName,
          Position: employee.Position,
        }));
        return res.status(200).json(response);
      }
    }

    res.status(200).json({ message: 'No employees found with 7 consecutive days of work.' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// router.get('/shift-conditions', async (req, res) => {
//   try {
//     const data = await Data.find({}).sort({ Date: 1 }); // Sort by date in ascending order

//     let consecutiveShifts = [];

//     for (let i = 1; i < data.length; i++) {
//       const currentDate = new Date(data[i].Date);
//       const prevDate = new Date(data[i - 1].Date);
//       const timeDifference = currentDate - prevDate;
//       const oneHour = 60 * 60 * 1000; // Number of milliseconds in an hour

//       // Check for consecutive shifts with less than 10 hours gap (greater than 1 hour)
//       if (timeDifference > oneHour && timeDifference < 10 * oneHour) {
//         consecutiveShifts.push({
//           EmployeeName: data[i].EmployeeName,
//           Position: data[i].Position,
//         });
//       } else {
//         consecutiveShifts = [];
//       }
//     }

//     // Send the results as JSON response
//     res.status(200).json({
//       consecutiveShifts,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// });

router.get('/shift-conditions', async (req, res) => {
  try {
    const data = await Data.find({}).sort({ Date: 1 }); // Sort by date in ascending order

    let consecutiveShifts = [];
    let longShifts = [];

    for (let i = 1; i < data.length; i++) {
      const currentDate = new Date(data[i].Date);
      const prevDate = new Date(data[i - 1].Date);
      const timeDifference = currentDate - prevDate;
      const oneHour = 60 * 60 * 1000; // Number of milliseconds in an hour

      // Check for consecutive shifts with less than 10 hours gap (greater than 1 hour)
      if (timeDifference > oneHour && timeDifference < 10 * oneHour) {
        consecutiveShifts.push({
          EmployeeName: data[i].EmployeeName,
          Position: data[i].Position,
        });
      } else {
        consecutiveShifts = [];
      }

      // Check for shifts longer than 14 hours
      const shiftHours = calculateShiftHours(data[i].Time, data[i].TimeOut);
      if (shiftHours > 14) {
        longShifts.push({
          EmployeeName: data[i].EmployeeName,
          Position: data[i].Position,
        });
      }
    }

    // Send the results as JSON responses
    res.status(200).json({
      consecutiveShifts,
      longShifts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Helper function to calculate shift hours
function calculateShiftHours(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const timeDifference = end - start;
  const hours = timeDifference / (60 * 60 * 1000); // Convert milliseconds to hours
  return hours;
}

module.exports = router;
