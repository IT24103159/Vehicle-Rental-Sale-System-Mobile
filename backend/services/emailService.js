const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'lionintheloop.dev@gmail.com',
    pass: 'xjvdpizqqjkychsi'
  }
});

const generatePDF = (booking, payment, customer, vehicle) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fillColor('#0056b3')
         .fontSize(24)
         .text('SAMARASINGHE MOTORS', { align: 'left' })
         .moveDown(0.5);

      doc.fillColor('#666666')
         .fontSize(10)
         .text('123 Main Road, Colombo, Sri Lanka')
         .text('Phone: +94 71 234 5678')
         .text('Email: info@samarasinghemotors.lk')
         .moveDown(2);

      // INVOICE title
      doc.fillColor('#333333')
         .fontSize(28)
         .text('INVOICE', 50, 100, { align: 'right' });

      doc.moveTo(50, 160).lineTo(550, 160).strokeColor('#0056b3').lineWidth(2).stroke();
      
      // Bill To
      doc.fillColor('#0056b3')
         .fontSize(14)
         .text('Bill To', 50, 180);
      
      doc.fillColor('#333333')
         .fontSize(10)
         .text(customer.fullName, 50, 205)
         .text(customer.phone || 'Not provided', 50, 220)
         .text(customer.email, 50, 235);

      // Invoice Info
      doc.text(`Invoice Number: INV-2026-${String(payment._id).slice(-4).toUpperCase()}`, 350, 180, { align: 'right' })
         .text(`Date of Issue: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, 350, 195, { align: 'right' })
         .text(`Booking ID: ${String(booking._id).slice(-6).toUpperCase()}`, 350, 210, { align: 'right' });

      // Table Header
      doc.moveTo(50, 270).lineTo(550, 270).strokeColor('#e0e0e0').lineWidth(1).stroke();
      
      doc.fillColor('#333333').fontSize(11).font('Helvetica-Bold')
         .text('Description', 50, 280)
         .text('Daily Rate', 250, 280)
         .text('Days', 400, 280)
         .text('Amount', 0, 280, { align: 'right' });

      doc.moveTo(50, 300).lineTo(550, 300).strokeColor('#e0e0e0').lineWidth(1).stroke();

      // Table Row
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      const amount = vehicle.dailyRate * days;

      doc.font('Helvetica').fontSize(10)
         .text(vehicle.name, 50, 315)
         .text(`LKR ${vehicle.dailyRate.toFixed(2)}`, 250, 315)
         .text(days.toString(), 400, 315)
         .text(`LKR ${amount.toFixed(2)}`, 0, 315, { align: 'right' });

      doc.moveTo(50, 335).lineTo(550, 335).strokeColor('#f0f0f0').lineWidth(1).stroke();

      // Totals
      const discount = (amount - booking.totalCost);
      
      doc.text('Sub Total:', 380, 360)
         .text(`LKR ${amount.toFixed(2)}`, 0, 360, { align: 'right' });

      doc.text('Discount:', 380, 380)
         .text(`LKR ${discount > 0 ? discount.toFixed(2) : '0.00'}`, 0, 380, { align: 'right' });

      doc.fillColor('#0056b3').font('Helvetica-Bold').fontSize(12)
         .text('Total Paid:', 380, 410)
         .text(`LKR ${booking.totalCost.toFixed(2)}`, 0, 410, { align: 'right' });

      // PAID stamp
      doc.save();
      doc.rotate(-15, { origin: [150, 450] });
      doc.rect(80, 420, 140, 50).strokeColor('#28a745').lineWidth(4).stroke();
      doc.fillColor('#28a745').fontSize(36).text('PAID', 105, 430);
      doc.restore();

      // Footer
      doc.fillColor('#666666').font('Helvetica').fontSize(9)
         .text('Terms & Conditions: Payments are non-refundable. Please keep this invoice for your records.', 50, 680, { align: 'center' })
         .text('Thank you for choosing Samarasinghe Motors!', 50, 695, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

exports.sendApprovalEmail = async (booking, payment, customer, vehicle) => {
  try {
    const pdfBuffer = await generatePDF(booking, payment, customer, vehicle);
    
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee;">
      <div style="background-color: #28a745; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Booking Confirmed!</h1>
      </div>
      <div style="padding: 20px;">
        <h2 style="color: #333;">Dear ${customer.fullName},</h2>
        <p style="color: #555; line-height: 1.6;">
          We are pleased to inform you that your payment of <strong>LKR ${booking.totalCost.toFixed(2)}</strong> has been successfully verified and approved.
        </p>
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
          <p style="margin: 5px 0; color: #333;"><strong>Vehicle:</strong> ${vehicle.name}</p>
          <p style="margin: 5px 0; color: #333;"><strong>Pickup Date:</strong> ${new Date(booking.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          <p style="margin: 5px 0; color: #333;"><strong>Return Date:</strong> ${new Date(booking.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
        </div>
        <p style="color: #555; line-height: 1.6;">Your official PDF invoice is attached to this email. Please review it for your records.</p>
        <p style="color: #d9534f; font-weight: bold; margin-top: 20px;">Important Reminder:</p>
        <p style="color: #555; line-height: 1.6;">
          Please remember to bring your <strong>Original Driving License</strong> and National Identity Card (NIC) when you come to collect the vehicle.
        </p>
        <p style="color: #555;">Thank you for choosing Samarasinghe Motors!</p>
      </div>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; color: #888; font-size: 12px;">
        <p>© 2026 Samarasinghe Motors. All rights reserved.</p>
        <p>123 Main Road, Colombo | +94 71 234 5678</p>
      </div>
    </div>
    `;

    await transporter.sendMail({
      from: '"Samarasinghe Motors" <lionintheloop.dev@gmail.com>',
      to: customer.email,
      subject: `Booking Confirmed - Invoice INV-2026-${String(payment._id).slice(-4).toUpperCase()}`,
      html: htmlContent,
      attachments: [
        {
          filename: `Invoice_INV-2026-${String(payment._id).slice(-4).toUpperCase()}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });
    console.log('Approval email sent to', customer.email);
  } catch (error) {
    console.error('Error sending approval email:', error);
  }
};

exports.sendRejectionEmail = async (payment, booking, customer) => {
  try {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee;">
      <div style="background-color: #dc3545; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Payment Update</h1>
      </div>
      <div style="padding: 20px;">
        <h2 style="color: #333;">Dear ${customer.fullName},</h2>
        <p style="color: #555; line-height: 1.6;">
          We regret to inform you that we could not approve your recent payment upload for <strong>Booking #${String(booking._id).slice(-6).toUpperCase()}</strong>.
        </p>
        <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; color: #856404; font-weight: bold;">Reason for Rejection:</p>
          <p style="margin: 0; color: #856404;">${payment.remarks || 'Bank slip is not clear'}</p>
        </div>
        <p style="color: #555; line-height: 1.6;">
          Please do not worry! Your booking request is still in our system, but your vehicle has not been reserved yet. To secure your booking, please log into your account and re-upload a clear copy of your payment slip.
        </p>
        <p style="color: #555;">If you have any questions, please contact our support team.</p>
      </div>
    </div>
    `;

    await transporter.sendMail({
      from: '"Samarasinghe Motors" <lionintheloop.dev@gmail.com>',
      to: customer.email,
      subject: `Payment Rejected - Booking #${String(booking._id).slice(-6).toUpperCase()}`,
      html: htmlContent
    });
    console.log('Rejection email sent to', customer.email);
  } catch (error) {
    console.error('Error sending rejection email:', error);
  }
};
