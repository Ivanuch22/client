// api/comment-message.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createTransport } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const {
                email,
                locale,
                link,
                userName
            } = req.body;


            const EMAIL = process.env.MAILER_EMAIL || '';
            const PASSWORD = process.env.MAILER_PASSWORD || '';

            const transporter = createTransport({
                port: 587,
                host: 'smtp.gmail.com',
                auth: {
                    user: EMAIL,
                    pass: PASSWORD,
                },
                secure: false,
            });

            let validatedLocale = "ru"
            if (['RU', 'UK', 'EN'].includes(locale)) {
                validatedLocale = locale;
            }
            const messagesss = messageFunc(link, validatedLocale);
            const mailoptions = {
                from: `"Noreply Trans-Hope" <websiterequestx@gmail.com>`,
                replyTo: "websiterequestx@gmail.com",
                to: email,
                subject: messagesss.title,
                text: messagesss.body,
            }


            await transporter.sendMail(mailoptions);
            return res.json({
                data: 'Message sent successfully'
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({ error });
        }
    } else {
        return res.status(405).json({ error: 'Метод не дозволений' });
    }
}


const messageFunc = (link: string, locale: string) => {
    const newLocal = locale as Locale; // Explicitly cast `locale` to `Locale`
    const message: Messages = {
        RU: {
            title: `Вы получили ответ на Ваш комментарий на сайте ${process.env.NEXT_FRONT_HOST}`,
            body: `
            Приветствуем Вас,



            Вы получили ответ на ваш комментарий на странице:
            
            ${link}
            
            
            
            С уважением
            
            Транс-Хоуп
            
            `
        },
        UK: {
            title: `Ви отримали відповідь на свій коментар на ${process.env.NEXT_FRONT_HOST}`,
            body: `
            Вітаємо Вас,



            Ви отримали відповідь на ваш коментар на сторінці:
            
            ${link}
            
            
            
            З повагою
            
            Транс-Хоуп
            `
        },
        EN: {
            title: `You have received a reply to your comment on ${process.env.NEXT_FRONT_HOST}`,
            body: `
            Greetings,



            You have received a reply to your comment on the page:
            
            ${link}
            
            
            
            Regards
            
            Trans-Hope
            `
        }
    }
    return message[newLocal];
}

interface MessageDetails {
    title: string;
    body: string;
}

interface Messages {
    RU: MessageDetails;
    UK: MessageDetails;
    EN: MessageDetails;
}

interface MessagesLocale {
    ru: string;
    uk: string;
    en: string;
}


interface MailOptions {
    name?: string;
    email: string;
    body?: string;
    locale: keyof Messages;
}

type Locale = keyof Messages; // 'ru' | 'ua' | 'en'