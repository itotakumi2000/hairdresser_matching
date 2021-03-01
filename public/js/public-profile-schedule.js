(function() {
  const isLeapYear = year => (year % 4 === 0) && (year % 100 !== 0) || (year % 400 === 0);
  const countDatesOfFeb = year => isLeapYear(year) ? 29 : 28;

  const createOption = (id, startNum, endNum, current) => {
    const selectDom = document.getElementById(id);
    let optionDom = '';
    for (let i = startNum; i <= endNum; i++) {
      if (i === current) {
        option = '<option value="' + i + '" selected>' + i + '</option>';
      } else {
        option = '<option value="' + i + '">' + i + '</option>';
      }
      optionDom += option;
    }
    selectDom.insertAdjacentHTML('beforeend', optionDom);
  }

  const yearBox = document.getElementById('select-year');
  const monthBox = document.getElementById('select-month');
  const dateBox = document.getElementById('select-day');

  const today = new Date();
  const thisYear = today.getFullYear();
  const thisMonth = today.getMonth() + 1;
  const thisDate = today.getDate();

  let datesOfYear= [31, countDatesOfFeb(thisYear), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  monthBox.addEventListener('change', (e) => {
    dateBox.innerHTML = '';
    const selectedMonth = e.target.value;
    createOption('select-day', 1, datesOfYear[selectedMonth - 1], 1);
  });

  yearBox.addEventListener('change', e => {
    monthBox.innerHTML = '';
    dateBox.innerHTML = '';
    const updatedYear = e.target.value;
    datesOfYear = [31, countDatesOfFeb(updatedYear), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    createOption('select-month', 1, 12, 1);
    createOption('select-day', 1, datesOfYear[0], 1);
  });

  createOption('select-year', thisYear, thisYear+1, thisYear);
  createOption('select-month', 1, 12, thisMonth);
  createOption('select-day', 1, datesOfYear[thisMonth - 1], thisDate);
})();