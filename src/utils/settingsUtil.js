import moment from 'moment';

const settingsUtil = {
  getPaydayDate: (payday) => {
    let payday_date;
    const currentDay = moment().date(); 
    
    if (payday) {
      if (currentDay >= payday) {
        payday_date = moment().date(payday).hour(0).minute(0).second(0); 
      } else {
        payday_date = moment().subtract(1, 'months').date(payday).hour(0).minute(0).second(0);
      }
    } else {
      payday_date = moment().date(0).hour(0).minute(0).second(0);
    }

    return payday_date.toISOString();
  }
}

export default settingsUtil;