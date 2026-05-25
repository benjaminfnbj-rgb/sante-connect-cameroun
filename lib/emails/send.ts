import { Resend } from 'resend'
import { emailTemplates } from './templates'

const resend = new Resend(
  process.env.RESEND_API_KEY || 're_SK6FzEzf_7wtWabAW5XRkeQ4V2LRnMRvz'
)
const FROM = 'Santé Connect Cameroun <noreply@santeconnect.cm>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://sante-connect-cameroun.vercel.app'

export const sendEmail = {

  welcome: async (to: string, name: string, verifyUrl: string) => {
    const { subject, html } = emailTemplates.welcome(name, verifyUrl)
    return resend.emails.send({ from: FROM, to, subject, html })
  },

  subscriptionReminder: async (to: string, name: string, expiryDate: string) => {
    const renewUrl = `${APP_URL}/tarifs`
    const { subject, html } = emailTemplates.subscriptionReminder(name, expiryDate, renewUrl)
    return resend.emails.send({ from: FROM, to, subject, html })
  },

  subscriptionExpired: async (to: string, name: string) => {
    const renewUrl = `${APP_URL}/tarifs`
    const { subject, html } = emailTemplates.subscriptionExpired(name, renewUrl)
    return resend.emails.send({ from: FROM, to, subject, html })
  },

  appointmentConfirmed: async (
    to: string, patientName: string, doctorName: string,
    date: string, time: string, location: string
  ) => {
    const { subject, html } = emailTemplates.appointmentConfirmed(patientName, doctorName, date, time, location)
    return resend.emails.send({ from: FROM, to, subject, html })
  },

  professionalApproved: async (to: string, name: string) => {
    const loginUrl = `${APP_URL}/connexion`
    const { subject, html } = emailTemplates.professionalApproved(name, loginUrl)
    return resend.emails.send({ from: FROM, to, subject, html })
  },

  orderConfirmed: async (
    to: string, name: string, orderRef: string,
    items: string, total: string, pharmacy: string
  ) => {
    const { subject, html } = emailTemplates.orderConfirmed(name, orderRef, items, total, pharmacy)
    return resend.emails.send({ from: FROM, to, subject, html })
  },
}
