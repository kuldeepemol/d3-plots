// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
  top: 60,
  right: 60,
  bottom: 100,
  left: 100
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set its dimensions
var svg = d3.select('#scatter')
  .append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

// Append a group area, then set its margins
var chartGroup = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Default to Axis label
var currentXAxis = 'poverty';
var currentYAxis = 'healthcare';

// Load data from miles-walked-this-month.csv
d3.csv('assets/data/data.csv').then(function(data) {

    // Cast the hours value to a number for each piece of data
    data.forEach(function(d) {
        d.poverty = +d.poverty;
        d.healthcare = +d.healthcare;
        d.age = +d.age;
        d.income = +d.income;
        d.smokes = +d.smokes;
        d.obesity = +d.obesity;
    });

    // xScale
    var xScale = getXScaleForAxis(data, currentXAxis);

    // yScale
    var yScale = getYScaleForAxis(data, currentYAxis);

    // create axes
    var yAxis = d3.axisLeft(yScale);
    var xAxis = d3.axisBottom(xScale);

    // set x to the bottom of the chart
    var xAxis = chartGroup.append('g')
                .attr('transform', `translate(0, ${chartHeight})`)
                .call(xAxis);

    // set y to the y axis
    var yAxis = chartGroup.append('g')
                .call(yAxis);

    // Create group for 3 x- axis labels
    var xLabelsGroup = chartGroup.append('g')
                        .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + 10})`);

    // Poverty Label
    var povertyLabel = xLabelsGroup.append('text')
                        .attr('x', 0)
                        .attr('y', 20)
                        .attr('value', 'poverty') // value to grab for event listener
                        .classed('active-x', true)
                        .text('In Poverty (%)');

    // Age Label
    var ageLabel = xLabelsGroup.append('text')
                        .attr('x', 0)
                        .attr('y', 40)
                        .attr('value', 'age') // value to grab for event listener
                        .classed('inactive-x', true)
                        .text('Age (Median)');
    
    // Household Income Label
    var householdIncomeLabel = xLabelsGroup.append('text')
                        .attr('x', 0)
                        .attr('y', 60)
                        .attr('value', 'income') // value to grab for event listener
                        .classed('inactive-x', true)
                        .text('Household Income (Median)');

    // Create group for 3 y-axis labels
    var yLabelsGroup = chartGroup.append('g')
                        .attr('transform', 'rotate(-90)');
    
    // Healthcare Label
    var healthcareLabel = yLabelsGroup.append('text')
                        .attr('y', 0 - 60)
                        .attr('x', 0 - (svgHeight / 2))
                        .attr('dy', '1em')
                        .attr('value', 'healthcare')
                        .classed('active-y', true)
                        .text('Lacks Healthcare (%)');

    // Smokes Label
    var smokeLabel = yLabelsGroup.append('text')
                        .attr('y', 0 - 80)
                        .attr('x', 0 - (svgHeight / 2))
                        .attr('dy', '1em')
                        .attr('value', 'smokes')
                        .classed('inactive-y', true)
                        .text('Smokes (%)');

    // Obese Label
    var obeseLabel = yLabelsGroup.append('text')
                        .attr('y', 0 - 100)
                        .attr('x', 0 - (svgHeight / 2))
                        .attr('dy', '1em')
                        .attr('value', 'obesity')
                        .classed('inactive-y', true)
                        .text('Obese (%)');

    // Create code to build the scatter chart using the data.
    var circlesGroup = chartGroup.selectAll('circle')
                        .data(data)
                        .enter()
                            .append('circle')
                            .classed('stateCircle', true)
                            .attr('r', d => 15)
                            .attr('cx', (d, i) => xScale(d[currentXAxis]))
                            .attr('cy', d => yScale(d[currentYAxis]));

    circlesGroup = updateToolTip(currentXAxis, currentYAxis, circlesGroup);

    // Append a group area, then set its margins
    var newChartGroup = svg.append('g')
                        .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Create code to build the text using the data.
    var textsGroup = newChartGroup.selectAll('text')
                        .data(data)
                        .enter()
                            .append('text')
                            .classed('stateText', true)
                            .attr('x', d => xScale(d[currentXAxis]))
                            .attr('y', d => yScale(d[currentYAxis])+5)
                            .text(d => `${d.abbr}`);

    textsGroup = updateToolTip(currentXAxis, currentYAxis, textsGroup);

    // x axis labels event listener
    xLabelsGroup.selectAll('text')
        .on('click', function() {
            // get value of selection
            var value = d3.select(this).attr('value');
            if (value !== currentXAxis) {

                // replaces currentXAxis with value
                currentXAxis = value;

                // functions here found above csv import
                // updates x scale for new data
                xScale = getXScaleForAxis(data, currentXAxis);

                // updates x axis with transition
                xAxis.transition()
                    .duration(1000)
                    .call(d3.axisBottom(xScale));

                // updates circles with new x values
                circlesGroup.transition()
                    .duration(1000)
                    .attr('cx', d => xScale(d[currentXAxis]));

                // updates tooltips with new info
                circlesGroup = updateToolTip(currentXAxis, currentYAxis, circlesGroup);

                // updates circles with new x values
                textsGroup.transition()
                    .duration(1000)
                        .attr('x', d => xScale(d[currentXAxis]))
                        .text(d => `${d.abbr}`);

                // updates tooltips with new info
                textsGroup = updateToolTip(currentXAxis, currentYAxis, textsGroup);

                // changes classes to change bold text
                if (currentXAxis === 'age') {
                    povertyLabel
                        .classed('active-x', false)
                        .classed('inactive-x', true);
                    ageLabel
                        .classed('active-x', true)
                        .classed('inactive-x', false);
                    householdIncomeLabel
                        .classed('active-x', false)
                        .classed('inactive-x', true);
                } else if (currentXAxis === 'income') {
                    povertyLabel
                        .classed('active-x', false)
                        .classed('inactive-x', true);
                    ageLabel
                        .classed('active-x', false)
                        .classed('inactive-x', true);
                    householdIncomeLabel
                        .classed('active-x', true)
                        .classed('inactive-x', false);
                } else {
                    povertyLabel
                        .classed('active-x', true)
                        .classed('inactive-x', false);
                    ageLabel
                        .classed('active-x', false)
                        .classed('inactive-x', true);
                    householdIncomeLabel
                        .classed('active-x', false)
                        .classed('inactive-x', true);
                }
            }
        });


    // y axis labels event listener
    yLabelsGroup.selectAll('text')
        .on('click', function() {
            // get value of selection
            var value = d3.select(this).attr('value');
            if (value !== currentYAxis) {

                // replaces currentYAxis with value
                currentYAxis = value;

                // functions here found above csv import
                // updates x scale for new data
                yScale = getYScaleForAxis(data, currentYAxis);

                // updates x axis with transition
                yAxis.transition()
                    .duration(1000)
                        .call(d3.axisLeft(yScale));

                // updates circles with new x values
                circlesGroup.transition()
                    .duration(1000)
                        .attr('cy', d => yScale(d[currentYAxis]));

                // updates tooltips with new info
                circlesGroup = updateToolTip(currentXAxis, currentYAxis, circlesGroup);

                // updates circles with new x values
                textsGroup.transition()
                    .duration(1000)
                        .attr('y', d => yScale(d[currentYAxis])+5)
                        .text(d => `${d.abbr}`);

                // updates tooltips with new info
                textsGroup = updateToolTip(currentXAxis, currentYAxis, textsGroup);

                // changes classes to change bold text
                if (currentYAxis === 'smokes') {
                    healthcareLabel
                        .classed('active-y', false)
                        .classed('inactive-y', true);
                    smokeLabel
                        .classed('active-y', true)
                        .classed('inactive-y', false);
                    obeseLabel
                        .classed('active-y', false)
                        .classed('inactive-y', true);
                } else if (currentYAxis === 'obesity') {
                    healthcareLabel
                        .classed('active-y', false)
                        .classed('inactive-y', true);
                    smokeLabel
                        .classed('active-y', false)
                        .classed('inactive-y', true);
                    obeseLabel
                        .classed('active-y', true)
                        .classed('inactive-y', false);
                } else {
                    healthcareLabel
                        .classed('active-y', true)
                        .classed('inactive-y', false);
                    smokeLabel
                        .classed('active-y', false)
                        .classed('inactive-y', true);
                    obeseLabel
                        .classed('active-y', false)
                        .classed('inactive-y', true);
                }
            }
        });




});  

// function used for updating x-scale var upon click on axis label
function getXScaleForAxis(data, currentXAxis) {

    var xmin = d3.min(data, d => d[currentXAxis]);
    var xmax = d3.max(data, d => d[currentXAxis]);

    // Adjust the min and max
    if (currentXAxis == 'income') {
        xmin = xmin - 4000;
        xmax = xmax + 5000;
    } else {
        xmin = xmin - 2;
        xmax = xmax + 2;
    }

    // create scales
    var xScale = d3.scaleLinear()
      //.domain(d3.extent(data, d => d[currentXAxis]))
      .domain([xmin, xmax])
      .range([0, chartWidth]);
  
    return xScale;
}

// function used for updating y-scale var upon click on axis label
function getYScaleForAxis(data, currentYAxis) {

    var ymin = d3.min(data, d => d[currentYAxis]);
    var ymax = d3.max(data, d => d[currentYAxis]);

    // Adjust the min and max
    ymin = ymin - 2;
    ymax = ymax + 4;

    // create scales
    var yScale = d3.scaleLinear()
      .domain([ymin, ymax])
      //.domain(d3.extent(data, d => d[currentYAxis]))
      .range([chartHeight, 0]);
  
    return yScale;
}

// function to get the label for given axis value
function getLabel(currentAxis) {
    label = '';

    if (currentAxis === 'poverty') {
        label = 'Poverty (%)';
    } else if (currentAxis === 'age') {
        label = 'Age (Median)';
    } else if (currentAxis === 'income') {
        label = 'Househole Income (Median)';
    } else if (currentAxis === 'healthcare') {
        label = 'Lacks Healthcare (%)';
    } else if (currentAxis === 'obesity') {
        label = 'Obesity (%)';
    } else if (currentAxis === 'smokes') {
        label = 'Smokes (%)';
    }

    return label;
}

// function used for updating circles/text group with new tooltip
function updateToolTip(currentXAxis, currentYAxis, circlesGroup) {
    var xlabel = getLabel(currentXAxis);
    var ylabel = getLabel(currentYAxis);

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(d => `State: ${d.state}<br>${xlabel}: ${d[currentXAxis]}<br>${ylabel}: ${d[currentYAxis]}`);
  
    circlesGroup.call(toolTip);
    circlesGroup
        .on('mouseover', toolTip.show)
        .on('mouseout', toolTip.hide);
  
    return circlesGroup;
}
  