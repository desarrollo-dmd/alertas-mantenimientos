const nodemailer = require("nodemailer");
const path = require("path");
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Error de conexión SMTP:", error);
    } else {
        console.log("✅ Servidor SMTP listo para enviar correos");
    }
});


function createMessage(client) {
    const { room_name, equipments, email } = client;

    const equipmentsList = equipments.map(eq => `
    <li>
      <strong>Equipo:</strong> ${eq}
    </li>
  `).join("");

    const message = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #0275d8;">🔧 Alerta de Mantenimiento Preventivo</h2>
      <p>Estimado cliente,</p>
      <p>
        Le informamos que los siguientes equipos de la sala <strong>${room_name}</strong> 
        tienen un mantenimiento programado próximamente:
      </p>
      <ul>
        ${equipmentsList}
      </ul>
      <p>Por favor, ingrese a la pagina de Telemetría para mas información.</p>
      <p>Atentamente,<br><strong>Equipo de Mantenimiento Preventivo</strong></p>
      <img src="cid:logoimg" alt="logo" width="100" height="100">
    </div>
  `;

    return message;
}


async function sendMail(mail, mensaje) {
    try {
        await transporter.sendMail({
            from: `"Mantenimiento DMD" <mantenimientosdmd@gmail.com>`,
            to: `${mail}`,
            subject: "Mantenimiento Telemetria",
            html: mensaje,
            attachments: [
                {
                    filename: 'logo.jpg',
                    path: path.join(__dirname, 'logo.jpg'),
                    cid: 'logoimg'
                }
            ],
        });
        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

async function processAndSendEmails(emailsObj) {
    const ids = Object.keys(emailsObj);

    for (const id of ids) {
        const client = emailsObj[id];

        if (!client.email) {
            console.log(`⚠️ Cliente ${id} no tiene email, se omite envío.`);
            continue;
        }

        const mensaje = createMessage(client);

        try {
            await sendMail(client.email, mensaje);
            console.log(`✅ Email enviado a cliente ${id} (${client.email})`);
        } catch (err) {
            console.error(`❌ Error al enviar email a cliente ${id} (${client.email}):`, err);
        }
    }
}


module.exports = { processAndSendEmails };