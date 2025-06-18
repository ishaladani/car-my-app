// import React, { useState, useEffect } from 'react';
// import { jsPDF } from 'jspdf';
// import { useNavigate } from 'react-router-dom';

// const generateJobCardPDF = (jobData, garageData, customerData, insuranceData, engineerData, laborHours, lastUpdateDate) => {
//   const doc = new jsPDF();

//   // Job card title
//   doc.setFontSize(18);
//   doc.text("Job Card", 14, 10);

//   // Add Garage Details (Left side)
//   doc.setFontSize(12);
//   doc.text("Garage Details", 14, 30);
//   doc.text(`Garage Name: ${garageData.name}`, 14, 40);
//   doc.text(`Garage Address: ${garageData.address}`, 14, 50);
//   doc.text(`Phone: ${garageData.phone}`, 14, 60);

//   // Add Customer Details (Right side)
//   doc.text("Customer Details", 100, 30);
//   doc.text(`Customer Name: ${customerData.name}`, 100, 40);
//   doc.text(`Car Number: ${customerData.carNumber}`, 100, 50);
//   doc.text(`Phone: ${customerData.phone}`, 100, 60);

//   // Insurance Details (Under Customer)
//   doc.text("Insurance Details", 100, 70);
//   doc.text(`Provider: ${insuranceData.provider}`, 100, 80);
//   doc.text(`Policy Number: ${insuranceData.policyNumber}`, 100, 90);
//   doc.text(`Expiry Date: ${insuranceData.expiryDate}`, 100, 100);

//   // Job Information (Under Insurance)
//   doc.text("Job Details", 14, 120);
//   doc.text(`Service: ${jobData.jobDetails}`, 14, 130);
//   doc.text(`Job Type: ${jobData.type}`, 14, 140);
  
//   // Engineer and Labor Information
//   doc.text("Engineer Details", 14, 150);
//   doc.text(`Engineer Name: ${engineerData.name}`, 14, 160);
//   doc.text(`Labor Hours: ${laborHours}`, 14, 170);
  
//   // Job Progress (based on status)
//   const progress = getJobProgress(jobData.status); // You can use the previous function to calculate this
//   doc.text(`Progress: ${progress}%`, 14, 180);

//   // Last Update Date
//   doc.text(`Last Update: ${lastUpdateDate}`, 14, 190);

//   // Job Progress Bar (optional, based on the job status)
//   doc.setFillColor(0, 255, 0);
//   const progressWidth = progress * 1.8;  // Scale progress to fit in the document
//   doc.rect(14, 200, progressWidth, 10, 'F'); // Fill the progress bar

//   // Add Job Card image zoom (Optional, will show image only if available)
//   if (jobData.image) {
//     const img = new Image();
//     img.src = jobData.image;
//     img.onload = function() {
//       doc.addImage(img, 'JPEG', 14, 210, 180, 100); // Adjust the size and position as needed
//       doc.save("JobCard.pdf");
//     };
//   } else {
//     // Save PDF if no image
//     doc.save("JobCard.pdf");
//   }
// };

// // Get Job Progress
// const getJobProgress = (status) => {
//   switch (status) {
//     case "Completed":
//       return 100;
//     case "In Progress":
//       return 50;
//     case "Pending":
//       return 25;
//     default:
//       return 0;
//   }
// };

// // Dashboard Component
// const Dashboard = () => {
//   const navigate = useNavigate();
//   let garageId = localStorage.getItem("garageId");
//   if (!garageId) {
//     garageId = localStorage.getItem("garage_id");
//   }

//   const [jobData, setJobData] = useState({
//     jobDetails: 'Repair Front Brake',
//     type: 'General Service',
//     status: 'In Progress',
//     image: '/path/to/image.jpg', // Optional: Include image if needed
//   });

//   const [garageData, setGarageData] = useState({
//     name: 'XYZ Garage',
//     address: '123 Street, City',
//     phone: '1234567890',
//   });

//   const [customerData, setCustomerData] = useState({
//     name: 'John Doe',
//     carNumber: 'ABC123',
//     phone: '0987654321',
//   });

//   const [insuranceData, setInsuranceData] = useState({
//     provider: 'XYZ Insurance',
//     policyNumber: 'XYZ12345',
//     expiryDate: '2023-12-31',
//   });

//   const [engineerData, setEngineerData] = useState({
//     name: 'Engineer A',
//   });

//   const [laborHours, setLaborHours] = useState(5);
//   const [lastUpdateDate, setLastUpdateDate] = useState('2023-06-18');

//   const handleGeneratePDF = () => {
//     generateJobCardPDF(jobData, garageData, customerData, insuranceData, engineerData, laborHours, lastUpdateDate);
//   };

//   return (
//     <div>
//       <h1>Job Card Dashboard</h1>
//       <button onClick={handleGeneratePDF}>Generate Job Card PDF</button>
//     </div>
//   );
// };

// export default Dashboard;
