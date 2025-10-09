const nodemailer = require('nodemailer');

// Configuración del transporter de email (en producción usarías servicios como SendGrid, AWS SES, etc.)
const createTransporter = () => {
  // Para desarrollo, usamos un transporter de prueba
  if (process.env.NODE_ENV === 'test') {
    return {
      sendMail: async (mailOptions) => {
        console.log('📧 [TEST MODE] Email would be sent:', mailOptions);
        return { messageId: 'test-message-id' };
      }
    };
  }

  // Configuración para producción (ejemplo con Gmail)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Función para formatear fecha y hora
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Función para generar el contenido del email de reagendado
const generateRescheduleEmailContent = (booking, oldBooking, changes) => {
  const changesText = Object.entries(changes)
    .map(([key, value]) => {
      switch (key) {
        case 'startTime':
          return `Nueva hora de inicio: ${formatDateTime(value)}`;
        case 'endTime':
          return `Nueva hora de fin: ${formatDateTime(value)}`;
        case 'roomId':
          return `Nueva sala: ${value}`;
        case 'purpose':
          return `Nuevo propósito: ${value}`;
        default:
          return `${key}: ${value}`;
      }
    })
    .join('\n');

  return {
    subject: 'Reserva reagendada - TAL-X',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Su reserva ha sido reagendada</h2>
        <p>Estimado empleado,</p>
        <p>Le informamos que su reserva ha sido modificada por el gestor de salas.</p>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Detalles de la reserva:</h3>
          <p><strong>ID de reserva:</strong> ${booking.id}</p>
          <p><strong>Sala:</strong> ${booking.roomId}</p>
          <p><strong>Fecha y hora de inicio:</strong> ${formatDateTime(booking.startTime)}</p>
          <p><strong>Fecha y hora de fin:</strong> ${formatDateTime(booking.endTime)}</p>
          <p><strong>Propósito:</strong> ${booking.purpose}</p>
          ${booking.attendees ? `<p><strong>Asistentes:</strong> ${booking.attendees}</p>` : ''}
        </div>

        ${changesText ? `
          <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Cambios realizados:</h3>
            <pre style="white-space: pre-line; margin: 0;">${changesText}</pre>
          </div>
        ` : ''}

        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0;"><strong>Nota:</strong> Si tiene algún inconveniente con los nuevos horarios, por favor contacte al gestor de salas.</p>
        </div>

        <p>Atentamente,<br>El equipo de gestión de salas - TAL-X</p>
      </div>
    `,
    text: `
Su reserva ha sido reagendada

Estimado empleado,

Le informamos que su reserva ha sido modificada por el gestor de salas.

Detalles de la reserva:
- ID de reserva: ${booking.id}
- Sala: ${booking.roomId}
- Fecha y hora de inicio: ${formatDateTime(booking.startTime)}
- Fecha y hora de fin: ${formatDateTime(booking.endTime)}
- Propósito: ${booking.purpose}
${booking.attendees ? `- Asistentes: ${booking.attendees}` : ''}

${changesText ? `Cambios realizados:
${changesText}` : ''}

Nota: Si tiene algún inconveniente con los nuevos horarios, por favor contacte al gestor de salas.

Atentamente,
El equipo de gestión de salas - TAL-X
    `
  };
};

// Función para generar el contenido del email de aprobación
const generateApprovalEmailContent = (booking, status, reason) => {
  const statusText = {
    approved: 'aprobada',
    rejected: 'rechazada',
    cancelled: 'cancelada'
  };

  return {
    subject: `Reserva ${statusText[status]} - TAL-X`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Estado de su reserva actualizado</h2>
        <p>Estimado empleado,</p>
        <p>Le informamos que su reserva ha sido <strong>${statusText[status]}</strong>.</p>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Detalles de la reserva:</h3>
          <p><strong>ID de reserva:</strong> ${booking.id}</p>
          <p><strong>Sala:</strong> ${booking.roomId}</p>
          <p><strong>Fecha y hora de inicio:</strong> ${formatDateTime(booking.startTime)}</p>
          <p><strong>Fecha y hora de fin:</strong> ${formatDateTime(booking.endTime)}</p>
          <p><strong>Propósito:</strong> ${booking.purpose}</p>
          ${booking.attendees ? `<p><strong>Asistentes:</strong> ${booking.attendees}</p>` : ''}
        </div>

        ${reason ? `
          <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Motivo:</h3>
            <p>${reason}</p>
          </div>
        ` : ''}

        <p>Atentamente,<br>El equipo de gestión de salas - TAL-X</p>
      </div>
    `,
    text: `
Estado de su reserva actualizado

Estimado empleado,

Le informamos que su reserva ha sido ${statusText[status]}.

Detalles de la reserva:
- ID de reserva: ${booking.id}
- Sala: ${booking.roomId}
- Fecha y hora de inicio: ${formatDateTime(booking.startTime)}
- Fecha y hora de fin: ${formatDateTime(booking.endTime)}
- Propósito: ${booking.purpose}
${booking.attendees ? `- Asistentes: ${booking.attendees}` : ''}

${reason ? `Motivo: ${reason}` : ''}

Atentamente,
El equipo de gestión de salas - TAL-X
    `
  };
};

// Función principal para enviar notificación
const sendNotification = async (notificationData) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@talx.com',
      to: notificationData.email,
      subject: notificationData.subject,
      text: notificationData.text,
      html: notificationData.html
    };

    const result = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: result.messageId,
      sentAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Función para enviar notificación de reagendado
const sendRescheduleNotification = async (booking, oldBooking, changes, userEmail) => {
  const emailContent = generateRescheduleEmailContent(booking, oldBooking, changes);

  const notificationData = {
    userId: booking.userId,
    bookingId: booking.id,
    type: 'booking_rescheduled',
    title: 'Reserva reagendada',
    message: `Su reserva ha sido reagendada. Sala: ${booking.roomId}, Fecha: ${formatDateTime(booking.startTime)}`,
    email: userEmail,
    metadata: {
      changes,
      oldBooking: {
        startTime: oldBooking.startTime,
        endTime: oldBooking.endTime,
        roomId: oldBooking.roomId
      }
    }
  };

  return await sendNotification({
    ...notificationData,
    ...emailContent
  });
};

// Función para enviar notificación de aprobación/rechazo
const sendApprovalNotification = async (booking, status, reason, userEmail) => {
  const emailContent = generateApprovalEmailContent(booking, status, reason);

  const notificationData = {
    userId: booking.userId,
    bookingId: booking.id,
    type: `booking_${status}`,
    title: `Reserva ${status}`,
    message: `Su reserva ha sido ${status === 'approved' ? 'aprobada' : status === 'rejected' ? 'rechazada' : 'cancelada'}`,
    email: userEmail,
    metadata: {
      status,
      reason
    }
  };

  return await sendNotification({
    ...notificationData,
    ...emailContent
  });
};

module.exports = {
  sendNotification,
  sendRescheduleNotification,
  sendApprovalNotification,
  formatDateTime
};