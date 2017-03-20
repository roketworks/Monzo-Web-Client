import moment from 'moment';

const settingsUtil = {
  getPaydayDate: (payday, month) => {
    let payday_date;
    const currentDay = moment().date(); 
    
    if (payday) {
      if (currentDay >= payday) {
        payday_date = moment().date(payday).month(month).hour(0).minute(0).second(0); 
      } else {
        payday_date = moment().month(month).date(payday).subtract(1, 'months').hour(0).minute(0).second(0);
      }
    } else {
      payday_date = moment().month(month).date(0).hour(0).minute(0).second(0);
    }

    return payday_date.toISOString();
  }
}

export default settingsUtil;