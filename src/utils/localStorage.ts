// import {Message} from '../types/ChatTypes';
//
// interface Chat {
//   id: string;
//   title: string;
//   messages: Message[];
// }
//
// export const getCustomBots = () => {
//   const bots = localStorage.getItem('customBots');
//   return bots ? JSON.parse(bots) : [];
// };
//
// export const saveCustomBots = (bots: any[]) => {
//   // Filter out default bots before saving
//   const customBots = bots.filter(bot => !bot.id.startsWith('default-'));
//   localStorage.setItem('customBots', JSON.stringify(customBots));
// };