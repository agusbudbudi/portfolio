// WhatsApp link generation for QA Mentoring Booking

import { formatDateForWhatsApp, parseDateId } from './dates';

interface WhatsAppParams {
  mentorPhone: string;
  mentorName: string;
  dateId: string; // YYYY-MM-DD
  time: string;   // HH:MM (start time)
  topics: string[];
  introduction: string;
  sessionDurationMinutes?: number;
}

/**
 * Calculates the end time from a start time + session duration
 */
function getEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const endDate = new Date(0, 0, 0, hours, minutes + durationMinutes);
  return `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
}

/**
 * Generates a pre-filled WhatsApp deep link with a booking confirmation message.
 * Returns the full wa.me URL.
 */
export function generateWhatsAppLink(params: WhatsAppParams): string {
  const {
    mentorPhone,
    mentorName,
    dateId,
    time,
    topics,
    introduction,
    sessionDurationMinutes = 60,
  } = params;

  const date = parseDateId(dateId);
  const dateLabel = formatDateForWhatsApp(date);
  const endTime = getEndTime(time, sessionDurationMinutes);
  const topicList = topics.map((t) => `- ${t}`).join('\n');

  const message = `Halo Mas/Mba ${mentorName},

Saya ingin booking sesi mentoring QA dengan Anda.

📅 Tanggal: ${dateLabel}
⏰ Waktu: ${time} - ${endTime} WIB

📚 Topik yang ingin dibahas:
${topicList}

💬 Detail Diskusi:
${introduction}

Apakah Anda bisa confirm ketersediaan slot ini?

Terima kasih!`;

  const encoded = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${mentorPhone}&text=${encoded}`;
}
