import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const RoutinePage = () => {
  const startOfWeek = moment().startOf('week');
  const daysOfWeek = Array.from({ length: 7 }).map((_, index) => startOfWeek.clone().add(index, 'days').format('dddd'));
  const [routines, setRoutines] = useState([]);
  const [isDownloadToggled, setIsDownloadToggled] = useState(false);
  const [activeSemester, setActiveSemester] = useState('5th');

  const fetchRoutines = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No token found in localStorage");
      }

      console.log("This is called twice for some reason");

      const response = await fetch("http://127.0.0.1:5000/api/v1/routines/", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (data.statusCode === 201) {
        setRoutines(data.data);
      } else {
        console.error('Failed to fetch routines:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  const downloadAsCSV = () => {
    const csvContent =
      "ID,Day,Start Time,End Time,Name,Category,Group\n" +
      routines.map(routine => {
        return `${routine.id},${routine.day},${routine.start_time},${routine.end_time},${routine.name},${routine.category},${routine.grp}`
      }).join("\n");

    const blob = new Blob([decodeURIComponent(encodeURI(csvContent))], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "routines.csv");
  };

  const downloadAsPDF = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text(`Routine for ${activeSemester} Semester`, 14, 22);

    const columns = ["Day", "Start Time", "End Time", "Name", "Category", "Group"];

    const rows = routines.map(routine => [
      routine.day,
      moment(routine.start_time, 'HH:mm:ss').format('h:mm A'),
      moment(routine.end_time, 'HH:mm:ss').format('h:mm A'),
      routine.name,
      routine.category,
      routine.grp
    ]);

    autoTable(pdf, {
      head: [columns],
      body: rows,
      startY: 30,
      theme: 'striped',
    });

    pdf.save('routine.pdf');
  };

  const interval = 50; // Interval in minutes

  // Generate intervals for a day (10:15 AM to 4:55 PM)
  const generateTimeSlots = () => {
    const slots = [];
    const start = moment('10:15 AM', 'h:mm A');
    const end = moment('4:05 PM', 'h:mm A');

    while (start <= end) {
      const endTime = start.clone().add(interval, 'minutes');
      slots.push({ start: start.format('h:mm A'), end: endTime.format('h:mm A') });
      start.add(interval, 'minutes');
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Set row height based on the interval
  const rowHeight = `calc((100vh - 10rem) / ${timeSlots.length})`;

  // Helper to find routines for a specific day and time
  const getRoutineForTimeSlot = (day, time) => {
    return routines.find(routine => {
      const routineDay = routine.day;
      const routineStartTime = moment(routine.start_time, 'HH:mm:ss');
      const routineEndTime = moment(routine.end_time, 'HH:mm:ss');
      const currentTime = moment(time, 'h:mm A');
      return routineDay === day && currentTime >= routineStartTime && currentTime < routineEndTime;
    });
  };

  const getRowSpan = (routine) => {
    const startTime = moment(routine.start_time, 'HH:mm:ss');
    const endTime = moment(routine.end_time, 'HH:mm:ss');
    const diff = endTime.diff(startTime, 'minutes');
    return diff / interval;
  };
  const renderedRoutines = new Set();

  return (
    <div className="h-screen flex flex-col text-white overflow-hidden">
      <div className="relative">
        <div className="flex justify-center items-center p-4">
          <h1 className="text-3xl font-bold">Routine for Semester {activeSemester}</h1>

          <button
            onClick={() => setIsDownloadToggled(!isDownloadToggled)}
            className="text-white px-4 py-2 rounded flex text-center hover:bg-indigo-900"
            style={{ position: 'absolute', top: '1rem', right: '1rem' }} >
            Download ▼
          </button>

          {isDownloadToggled && (
            <div className="absolute top-full right-0 mt-1 w-48 rounded z-10">
              <button onClick={downloadAsCSV} className="rounded block w-full text-center text-white px-4 py-2 bg-indigo-800 hover:border-2 hover:border-indigo-500">
                Download as CSV
              </button>
              <button onClick={downloadAsPDF} className="rounded block w-full text-center text-white bg-indigo-800 px-4 py-2 hover:border-2 hover:border-indigo-500">
                Download as PDF
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-grow p-4 overflow-x-auto">
        <table className="w-full table-fixed border-collapse border border-white">
          <thead>
            <tr className="border border-white">
              <th className="w-1/8 text-center border border-white">Time</th>
              {daysOfWeek.map((day, index) => (
                <th key={index} className="w-1/8 text-center border border-white whitespace-nowrap">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, rowIndex) => (
              <tr key={rowIndex} style={{ height: rowHeight }}>
                <td className="text-center border border-white">
                  {slot.start} - {slot.end}
                </td>
                {daysOfWeek.map((day, colIndex) => {
                  const routine = getRoutineForTimeSlot(day, slot.start);
                  if (routine) {
                    const routineId = `${routine.id}`;
                    if (!renderedRoutines.has(routineId)) {
                      renderedRoutines.add(routineId);
                      const rowSpan = getRowSpan(routine);
                      const routineClass = routine.category === 'Lab' ? 'bg-red-500' : 'bg-green-500';
                      return (
                        <td
                          key={colIndex}
                          rowSpan={rowSpan}
                          className={`text-center border border-white ${routineClass}`}
                        >
                          {routine.name} - {routine.category} - {routine.grp}
                        </td>
                      );
                    }
                    return null;
                  } else {
                    return (<td key={colIndex} className="text-center border border-white"></td>);
                  }
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoutinePage;
