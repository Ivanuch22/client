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
            
            // Додайте логіку перевірки даних та обробки запиту як ви це робили у попередньому файлі
            
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
            if (['ru', 'uk', 'en'].includes(locale)) {
                validatedLocale = locale;
            }
            const messagesss = messageFunc(link,validatedLocale);
            const mailoptions = {
                from: EMAIL,
                to: email,
                subject: messagesss.title,
                text: messagesss.body,
            }


            await transporter.sendMail(mailoptions);
            console.log('Письмо успешно отправлено')
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


const messageFunc = (link:string, locale:string)=>{
    const newLocal = locale as Locale; // Explicitly cast `locale` to `Locale`
    const message:Messages = {
        ru:{
            title: "Вы получили ответ на Ваш комментарий на сайте t-h-logistics.com",
            body: `
            Приветствуем Вас,



            Вы получили ответ на ваш комментарий на странице:
            
            ${link}
            
            
            
            С уважением
            
            Транс-Хоуп
            
            `
        },
        uk:{
            title: `You have received a reply to your comment on t-h-logistics.com`,
            body: `
            Вітаємо Вас,



            Ви отримали відповідь на ваш коментар на сторінці:
            
            ${link}
            
            
            
            З повагою
            
            Транс-Хоуп
            `
        },
        en:{
            title: "Account activation on the site t-h-logistics.com",
            body:`
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
    ru: MessageDetails;
    uk: MessageDetails;
    en: MessageDetails;
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