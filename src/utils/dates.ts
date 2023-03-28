import { Language } from './lang/languageContext';

export const getDateDifference = (date: EpochTimeStamp, lang: Language) => {
  let diffTime = Math.abs(Date.now() - date);
  let days = diffTime / (24 * 60 * 60 * 1000);
  let hours = (days % 1) * 24;
  let minutes = (hours % 1) * 60;
  let secs = (minutes % 1) * 60;

  [days, hours, minutes, secs] = [
    Math.floor(days),
    Math.floor(hours),
    Math.floor(minutes),
    Math.floor(secs),
  ];
  //format datestring per specs
  let dateString = '';
  if (days > 0) {
    dateString = days ? `${days}${lang === 'en' ? ' days' : '일 남음'}` : '';
  } else if (hours > 0) {
    dateString = hours
      ? `${hours} ${lang === 'en' ? 'hours' : '시간 남음'}`
      : '';
  } else if (minutes > 10) {
    dateString = minutes
      ? `${minutes} ${lang === 'en' ? 'minutes' : '분 남음'}`
      : '';
  } else {
    dateString = '';
  }

  return dateString;
};

export const getDateDifferenceLong = (date: EpochTimeStamp, lang: Language) => {
  let diffTime = Math.abs(Date.now() - date);
  let days = diffTime / (24 * 60 * 60 * 1000);
  let hours = (days % 1) * 24;
  let minutes = (hours % 1) * 60;
  let secs = (minutes % 1) * 60;
  [days, hours, minutes, secs] = [
    Math.floor(days),
    Math.floor(hours),
    Math.floor(minutes),
    Math.floor(secs),
  ];
  //format datestring per specs
  let dateString =
    lang === 'en'
      ? `${days}d ${hours}h ${minutes}m`
      : `${days}일 ${hours}시 ${minutes}분`;

  return dateString;
};

export const getDaysLeft = (countdown: EpochTimeStamp) => {
  return Math.floor(Math.abs(Date.now() - countdown) / (24 * 60 * 60 * 1000));
};

export const getFormattedTimestamp = (
  timestamp: EpochTimeStamp | string,
  lang: Language
) => {
  const dateString =
    lang === 'en'
      ? new Date(timestamp).toDateString()
      : new Date(timestamp).toLocaleString('ko-KR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

  const date =
    dateString.split(' ').slice(1, 3).join(' ') +
    ', ' +
    dateString.split(' ').at(3);

  const time = Intl.DateTimeFormat('hk-HK', {
    timeStyle: 'short',
    hourCycle: 'h12',
  })
    .format(typeof timestamp === 'string' ? new Date(timestamp) : timestamp)
    .toUpperCase();
  return { date: lang === 'en' ? date : dateString, time };
};
