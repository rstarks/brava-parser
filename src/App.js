import React, { Component } from 'react';
import './App.css';
import bravaScriptData from "./chicken-vegetables.py";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: fetch(bravaScriptData).then(res => res.text()),
      parsed: 'Parsed code output'
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    fetch(bravaScriptData)
      .then(res => res.text())
      .then(text => this.setState({value: text}))
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    //alert('BravaScript parsed: ' + this.state.value);
    event.preventDefault();

    // Run function to parse the code
    this.parseBravaScript(this.state.value);
  }

  getChild(index) { return index+1; }
  getGrandchild(index) { return index+2; }

  // Loops through submitted BravaScript as a large array, pulling out each section and reassembling into a JavaScript object, then finally returns valid JSON of the parsed script.
  parseBravaScript(code) {
    //console.log(code + '\n Parse operation complete');
    const processedArray = {};
    const params = {};
    const steps = {};
    let heaters = {};
    let currentStep = '';
    
    // Regexes
    const stripSpaces = /"[^"]*"|\S+/gm; // Strips spaces
    code = code.replace(/:/g,''); // Strips colons

    let rawCodeArray = code.match(stripSpaces);
    console.log(rawCodeArray);
    //this.setState({parsed: processedArray.join('\n')});

    rawCodeArray.forEach((element, index) => {
      //console.log(`${element} at ${index}`);

      switch (element) {
        case 'param':
          // Retrieve parameters
          params[rawCodeArray[this.getChild(index)]] = rawCodeArray[this.getGrandchild(index)];
          break;

        case 'step':
          // Get the steps
          var exitCondition = {
            time: rawCodeArray[index+5],
            step: rawCodeArray[index+7]
          }
          steps[rawCodeArray[this.getChild(index)]] = exitCondition;
          
          currentStep = rawCodeArray[this.getChild(index)];
          //rawCodeArray[this.getGrandchild(index)];
          break;

        case 'when':
          // Get the exit conditions
          break;

        case 'then':
          // Get the exit step
          break;

        case 'heater':
          // Get the heater arrays

          var heatersArray = [
            rawCodeArray[index+1],
            rawCodeArray[index+2],
            rawCodeArray[index+3],
            rawCodeArray[index+4],
            rawCodeArray[index+5],
            rawCodeArray[index+6]
          ];
          if (rawCodeArray[index+1] !== "off") {
            steps[currentStep].heaters = heatersArray;
          }

          //steps[currentStep].push(heaters);
          heaters = {};
          break;

        case 'for':
          // Get the heater timings
          break;

        default:
          break;
      }
    });

    processedArray.params = params;
    processedArray.steps = steps;

    var replacer = function(k, v) { if (v === undefined) { return null; } return v; };
    
    // Convert the JS object into JSON, display the results
    var jsonString = JSON.stringify(processedArray, null, 2);
    this.setState({parsed: jsonString});
  }

  render() {
    return (
      <div className="App">
        <form onSubmit={this.handleSubmit}>
          <label>
            Enter BravaScript:
          </label>
          <textarea 
            value={this.state.value}
            onChange={this.handleChange}
          />
          
          <button type="submit" value="Submit">Submit</button>
        </form>
        <div className='output'>
          <pre>
            {this.state.parsed}
          </pre>
        </div>
      </div>
    );
  }
}

export default App;