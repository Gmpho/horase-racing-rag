import axios from 'axios';
import * as cheerio from 'cheerio';

export const scrapeRaceResults = async (raceMeetingUrl: string) => {
  try {
    const response = await axios.get(raceMeetingUrl);
    const html = response.data;
    const $ = cheerio.load(html);

    // Select the elements containing race results (adjust selector as needed)
    const raceResults = $('.results-table tr');

    const results: Array<{ horseName: string, jockeyName: string, trainerName: string, finishingPosition: string }> = [];
    raceResults.each((_, element) => {
      const horseName = $(element).find('.horse-name').text().trim();
      const jockeyName = $(element).find('.jockey-name').text().trim();
      const trainerName = $(element).find('.trainer-name').text().trim();
      const finishingPosition = $(element).find('.finishing-position').text().trim();

      results.push({
        horseName,
        jockeyName,
        trainerName,
        finishingPosition,
      });
    });

    return results;
  } catch (error) {
    console.error('Error scraping race results:', error);
    throw error;
  }
};

// Example usage (replace with a real race meeting URL)
scrapeRaceResults('https://www.racingpost.com/racecards/1/october/cheltenham/1430')
  .then(results => console.log(results))
  .catch(error => console.error(error));