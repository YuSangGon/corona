const _ = require('lodash');
const countryInfo = require('../../tools/downloaded/countryInfo.json');

const { subDays } = require('date-fns');
const { format, utcToZonedTime } = require('date-fns-tz');
const axios = require('axios');

const ApiClient = require('./api-client');
const notice = require('../../tools/downloaded/notice.json');

const path = require('path');
const fs = require('fs-extra');
//const { da } = require('date-fns/locale');
const { getYouTubeVideosByKeyword } = require('./youtube'); 

async function getDataSource() {
    const countryByCc = _.keyBy(countryInfo, 'cc');
    const apiClient = new ApiClient();

    const allGlobalStats = await apiClient.getAllGlobalStats();

    const groupedByDate = _.groupBy(allGlobalStats, 'date');
    const globalStats = generateGlobalStats(groupedByDate);

    const gloabalChartDataByCc = generateGlobalChartDataByCc(groupedByDate);
    const koreaTestChartData = generateKoreaTestChartData(allGlobalStats);

    const {byAge, bySex} = await apiClient.getByAgeAndBySex();
    const youtubeVideos = await getYouTubeVideosByKeyword('코로나19');

    Object.keys(gloabalChartDataByCc).forEach((cc) => {
      const genPath = path.join(process.cwd(), `static/generated/${cc}.json`);
      fs.outputFileSync(genPath, JSON.stringify(gloabalChartDataByCc[cc]));
    });

    return {
        lastUpdated: Date.now(),
        globalStats,
        countryByCc,
        notice: notice.filter((x) => !x.hidden),
        koreaTestChartData,
        koreaBySexChartData: bySex,
        koreaByAgeChartData: byAge,
        youtubeVideos,
    };
}

function generateKoreaTestChartData(allGlobalStats) {
  const krData = allGlobalStats.filter((x) => x.cc === 'KR');

  return {
    date : krData.map((x) => x.date),
    confirmedRate: krData.map((x)=> x.confirmed / (x.confirmed + x.negative)),
    confirmed: krData.map((x)=> x.confirmed),
    negative: krData.map((x) => x.negative),
    testing: krData.map((x) => x.testing),
  };
}

function generateGlobalStats(groupedByDate) {
    // const now = new Date();
    const now = new Date('2021-06-05');
    const timeZone = 'Asia/Seoul';
    const today = format(utcToZonedTime(now, timeZone), 'yyyy-MM-dd');
    const yesterday = format(
      utcToZonedTime(subDays(now, 1), timeZone),
      'yyyy-MM-dd',
    );
  
    if (!groupedByDate[today]) {
      throw new Error('Data for today is missing');
    }
  
    return createGlobalStatWithPrevField(
      groupedByDate[today],
      groupedByDate[yesterday],
    );
}

function createGlobalStatWithPrevField(todayStats, yesterdayStats) {
    const yesterdayStatsByCc = _.keyBy(yesterdayStats, 'cc');
  
    const globalStatWithPrev = todayStats.map((todayStat) => {
      const cc = todayStat.cc;
      const yesterdayStat = yesterdayStatsByCc[cc];
      if (yesterdayStat) {
        return {
          ...todayStat,
          confirmedPrev: yesterdayStat.confirmed || 0,
          deathPrev: yesterdayStat.death || 0,
          negativePrev: yesterdayStat.negative || 0,
          releasedPrev: yesterdayStat.released || 0,
          testedPrev: yesterdayStat.tested || 0,
        };
      }
  
      return todayStat;
    });
  
    return globalStatWithPrev;
}

function generateGlobalChartDataByCc(groupedByDate) {
  const chartDataByCc = {};

  const dates = Object.keys(groupedByDate).sort();
  for (const date of dates) {
    const countriesDataForOneDay = groupedByDate[date];
    for (const countryData of countriesDataForOneDay) {
      const cc = countryData.cc;

      if(!chartDataByCc[cc]) {
        chartDataByCc[cc] = {
          date: [],
          confirmed: [],
          confirmedAcc: [],
          death: [],
          deathAcc: [],
          released: [],
          releasedAcc: [],
        };
      }
      appendToChartData(chartDataByCc[cc], countryData, date);
    }

    if(!chartDataByCc['global']) {
      chartDataByCc['global'] = {
        date: [],
        confirmed: [],
        confirmedAcc: [],
        death: [],
        deathAcc: [],
        released: [],
        releasedAcc: [],
      };
    }

    const countryDataSum = countriesDataForOneDay.reduce(
      (sum, x) => ({
        confirmed: sum.confirmed + x.confirmed,
        death: sum.death + x.death,
        released: sum.released + (x.released || 0),
      }),
      {confirmed: 0, death: 0, released: 0},
    );

    appendToChartData(chartDataByCc['global'], countryDataSum, date);
  }

  return chartDataByCc;
}

function appendToChartData(chartData, countryData, date) {
  // 전일 데이터가 없는 경우 현재 날짜 데이터를 그대로 사용
  if (chartData.date.length === 0) {
    chartData.confirmed.push(countryData.confirmed);
    chartData.death.push(countryData.death);
    chartData.released.push(countryData.released);
  } else {
    // 전일 대비 증가량을 저장
    const confirmedIncrement =
      countryData.confirmed - _.last(chartData.confirmedAcc) || 0;
    chartData.confirmed.push(confirmedIncrement);

    const deathIncrement = countryData.death - _.last(chartData.deathAcc) || 0;
    chartData.death.push(deathIncrement);

    const releasedIncrement =
      countryData.released - _.last(chartData.releasedAcc) || 0;
    chartData.released.push(releasedIncrement);
  }

  chartData.confirmedAcc.push(countryData.confirmed);
  chartData.deathAcc.push(countryData.death);
  chartData.releasedAcc.push(countryData.released);

  chartData.date.push(date);
}


module.exports = {
    getDataSource,
};