/* eslint-disable linebreak-style */
/* eslint-disable func-names */
/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
// ! Beginning functions, which would go to helper functions
// ! Function for text justification
function wrap(text) {
  text.each(function () {
    const textInBox = d3.select(this);
    const words = textInBox.text().split(/\s+/).reverse();
    const lineHeight = 15;
    const width = parseFloat(textInBox.attr('width'));
    const y = parseFloat(textInBox.attr('y'));
    const x = textInBox.attr('x');
    const anchor = textInBox.attr('text-anchor');

    let tspan = textInBox
      .text(null)
      .append('tspan')
      .attr('x', x)
      .attr('y', y)
      .attr('text-anchor', anchor);
    let lineNumber = 0;
    let line = [];
    let word = words.pop();

    while (word) {
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width) {
        lineNumber += 1;
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        tspan = textInBox
          .append('tspan')
          .attr('x', x)
          .attr('y', y + lineNumber * lineHeight)
          .attr('anchor', anchor)
          .text(word);
      }
      word = words.pop();
    }
  });
}
// * Segmenting the legend
function displayOnX(d, i, size) {
  // For x distance
  const k = (i % 4) + 1; // change "4" to change number of elements in one row
  return 160 * k + size / 2; // change "160" for distance on x axis
}
function displayOnY(d, i) {
  // For y distance
  const k = Math.floor(i / 4) + 1; // should correspond to "4" above
  return 25 * k; // change "30" for distance on y axis
}
// ! All datasets for switching the data are below
const videoGamesData = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json';
const kickstarterProjectsData = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json';
const movieSalesData = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';

const movieSalesObject = {
  data: movieSalesData,
  title: 'Movie Sales',
  description: 'Top 100 Highest Grossing Movies Grouped By Genre',
};
const videoGames = {
  data: videoGamesData,
  title: 'Videogame Sales',
  description: 'Top 100 Most Sold Video Games Grouped by Platform',
};
const kickstarterProjects = {
  data: kickstarterProjectsData,
  title: 'Kickstarter Pledges',
  description: 'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category',
};

function renderWholeSvg(dataset, title, description) {
  // ! Getting the data
  d3.json(dataset).then((data) => {
    // ! Defining width and height of SVG container
    const width = 1100;
    const height = 1200;

    // ! Create SVG Element
    const treeMap = d3
      .select('body')
      .append('svg')
      .attr('height', height)
      .attr('width', width)
      .attr('id', 'treeMap');

    // ! Margin convention
    margin = {
      top: 125,
      right: 0,
      bottom: 150,
      left: 0,
    };
    const innerWidth = width - margin.right - margin.left;
    const innerHeight = height - margin.top - margin.bottom;
    const gTreeMap = treeMap
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    // ! Defining treemap
    const root = d3.hierarchy(data).sum((d) => d.value);
    // eslint-disable-next-line no-unused-vars
    const treeMapLayout = d3
      .treemap()
      .size([innerWidth, innerHeight])
      .padding(0)(root);
    let arrayOfCategories = root.leaves().map((a) => a.data.category);
    arrayOfCategories = arrayOfCategories.filter(
      (item, pos) => arrayOfCategories.indexOf(item) === pos,
    );
    // ! Defining colors range to be used
    // prettier-ignore
    const colors = ['steelblue', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990', '#dcbeff', '#9A6324', '#fffac8', '#806666', '#808000', '#ffd8b1', '#22BB75', '#AA4400'];
    const depthScale = d3.scaleOrdinal().range(colors);
    // * Defining tooltip
    const tooltipForData = d3
      .select('body')
      .append('div')
      .attr('id', 'tooltip')
      .style('opacity', 0);
    const tiles = gTreeMap
      .selectAll('rect')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('class', 'rectContainer')
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0)
      .attr('data-value', (d) => d.data.value)
      .on('mouseover', (event, d) => {
        tooltipForData.transition().duration(100).style('opacity', 0.85);
        tooltipForData
          .html(
            `Name: ${d.data.name}<br>`
              + `Category: ${d.data.category}<br>`
              + `Value: ${d.data.value}`,
          )

          .style('left', `${parseFloat(event.pageX) + 30}px`)
          .style('top', `${event.pageY - 30}px`)
          .attr('data-value', d.data.value);
      })
      .on('mouseout', () => {
        tooltipForData.transition().style('opacity', 0);
      });
    tiles
      .append('rect')
      .attr('class', 'tile')
      .attr('data-name', (d) => d.data.name)
      .attr('data-category', (d) => d.data.category)
      .attr('data-value', (d) => d.data.value)
      .attr('x', (d) => d.x0)
      .attr('y', (d) => d.y0)
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0)
      .style('fill', (d) => depthScale(d.parent.data.name))
      .style('stroke', 'black');
    const textFont = 9;
    tiles
      .append('text')
      .attr('class', 'descText')
      .attr('x', (d) => d.x0 + 2)
      .attr('y', (d) => d.y0 + textFont)
      .style('font-size', `${textFont}px`)
      .text((d) => d.data.name)
      .attr('width', (d) => d.x1 - d.x0 - 15);
    d3.selectAll('.descText').call(wrap);

    // ! Legend
    const color = d3.scaleOrdinal().domain(arrayOfCategories).range(colors);
    const size = 20;
    const gLegend = treeMap
      .append('g')
      .attr('id', 'legend')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight})`);

    // * For rectangles
    gLegend
      .selectAll('myRects')
      .data(arrayOfCategories)
      .enter()
      .append('rect')
      .attr('x', (d, i) => displayOnX(d, i, size) - size - 5)
      .attr('y', (d, i) => displayOnY(d, i, size) - size / 2) // 100 is where the first dot appears. 25 is the distance between dots
      .attr('width', size)
      .attr('height', size)
      .attr('class', 'legend-item')
      .style('fill', (d) => color(d))
      .style('stroke', 'black');
    // * For labels
    gLegend
      .selectAll('myLabels')
      .data(arrayOfCategories)
      .enter()
      .append('text')
      .attr('x', (d, i) => displayOnX(d, i, size))
      .attr('y', (d, i) => displayOnY(d, i, size) + 2)
      .style('fill', (d) => color(d))
      .text((d) => d)
      .attr('text-anchor', 'left')
      .style('alignment-baseline', 'middle')
      .style('stroke', 'black')
      .style('stroke-width', 0.2);

    // ! Tweaking legend automatically to fit approximately on center
    gLegend.attr(
      'transform',
      `translate(${width / 2 - gLegend.node().getBBox().width / 1.5}, ${
        innerHeight + 120
      })`,
    );

    // ! Introducing title and description
    treeMap
      .append('text')
      .text(title)
      .attr('id', 'title')
      .attr('x', innerWidth / 2)
      .attr('y', 60);
    treeMap
      .append('text')
      .text(description)
      .attr('id', 'description')
      .attr('x', innerWidth / 2)
      .attr('y', 95);
    // ! Introducing buttons for changing the dataset
    const buttonWidth = 150;
    const buttonHeight = 40;
    const buttonColor = '#FFC500';
    const hoverColor = 'red';
    // * Video game sales
    const gButtons = treeMap
      .append('g')
      .attr('id', 'buttons')
      .attr('transform', `translate(${10}, ${20})`);
    const videoGamesButton = gButtons
      .append('g')
      .attr('class', 'button')
      .on('click', () => {
        d3.select('#tooltip').remove();
        d3.select('svg').remove();
        renderWholeSvg(
          videoGames.data,
          videoGames.title,
          videoGames.description,
        );
      });
    videoGamesButton
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('id', 'videoGamesButton')
      .attr('width', buttonWidth)
      .attr('height', buttonHeight)
      .attr('stroke', 'black')
      .attr('fill', buttonColor)
      // eslint-disable-next-line func-names
      .on('mouseover', function () {
        d3.select(this).style('fill', hoverColor);
      })
      .on('mouseout', function () {
        d3.select(this).style('fill', buttonColor);
      });
    videoGamesButton
      .append('text')
      .attr('x', buttonWidth / 2)
      .attr('y', buttonHeight / 2)
      .attr('dy', '.35em')
      .style('text-anchor', 'middle')
      .text('Video Game Dataset')
      .on('mouseover', () => {
        d3.select('#videoGamesButton').style('fill', hoverColor);
      })
      .on('mouseout', () => {
        d3.select('#videoGamesButton').style('fill', buttonColor);
      });

    // * Kickstarter projects
    const kickStarterButton = gButtons
      .append('g')
      .attr('class', 'button')
      .on('click', () => {
        d3.select('#tooltip').remove();
        d3.select('svg').remove();
        renderWholeSvg(
          kickstarterProjects.data,
          kickstarterProjects.title,
          kickstarterProjects.description,
        );
      });
    kickStarterButton
      .append('rect')
      .attr('x', buttonWidth + 10)
      .attr('y', 0)
      .attr('id', 'kickStarterButton')
      .attr('width', buttonWidth)
      .attr('height', buttonHeight)
      .attr('stroke', 'black')
      .attr('fill', buttonColor)
      .on('mouseover', function () {
        d3.select(this).style('fill', hoverColor);
      })
      .on('mouseout', function () {
        d3.select(this).style('fill', buttonColor);
      });
    kickStarterButton
      .append('text')
      .attr('x', buttonWidth + 10 + buttonWidth / 2)
      .attr('y', buttonHeight / 2)
      .attr('dy', '.35em')
      .style('text-anchor', 'middle')
      .text('Kickstarter Dataset')
      .on('mouseover', () => {
        d3.select('#kickStarterButton').style('fill', hoverColor);
      })
      .on('mouseout', () => {
        d3.select('#kickStarterButton').style('fill', buttonColor);
      });

    // * Movie Sales
    const movieSales = gButtons
      .append('g')
      .attr('class', 'button')
      .on('click', () => {
        d3.select('#tooltip').remove();
        d3.select('svg').remove();
        renderWholeSvg(
          movieSalesObject.data,
          movieSalesObject.title,
          movieSalesObject.description,
        );
      });
    movieSales
      .append('rect')
      .attr('x', buttonWidth / 2)
      .attr('y', buttonHeight + 10)
      .attr('id', 'movieSales')
      .attr('width', buttonWidth)
      .attr('height', buttonHeight)
      .attr('stroke', 'black')
      .attr('fill', buttonColor)
      .on('mouseover', function () {
        d3.select(this).style('fill', hoverColor);
      })
      .on('mouseout', function () {
        d3.select(this).style('fill', buttonColor);
      });
    movieSales
      .append('text')
      .attr('x', buttonWidth)
      .attr('y', buttonHeight + 10 + buttonHeight / 2)
      .attr('dy', '.35em')
      .style('text-anchor', 'middle')
      .text('Movies Dataset')
      .on('mouseover', () => {
        d3.select('#movieSales').style('fill', hoverColor);
      })
      .on('mouseout', () => {
        d3.select('#movieSales').style('fill', buttonColor);
      });
    // ! Adding source
    const divSource = d3
      .select('svg')
      .append('g')
      .attr(
        'transform',
        `translate(${width - margin.right - 20}, ${height - 20})`,
      );
    divSource
      .append('text')
      .attr('class', 'textSource')
      .text('Data source: ')
      .append('a')
      .attr('class', 'linkSource')
      .attr('href', dataset)
      .attr('target', '_blank')
      .text('https://cdn.freecodecamp.org/...');

    // ! Adding author
    const author = d3
      .select('svg')
      .append('g')
      .attr('transform', `translate(${width - margin.right - 2}, ${50})`);
    author
      .append('text')
      .attr('class', 'nameAuthor')
      .text('Coded and created by ')
      .append('a')
      .attr('href', 'https://www.linkedin.com/in/davor-jovanovi%C4%87/')
      .attr('target', '_blank')
      .text('DavorJ');
  });
}

// ! Render svg on load of the page
window.onload = renderWholeSvg(
  videoGames.data,
  videoGames.title,
  videoGames.description,
);
