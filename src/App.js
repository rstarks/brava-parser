import React, { Component } from 'react';
import './App.css';
import bravaScriptData from "./chicken-vegetables.py";

class Step extends Component {
  render() {
    return (
      <div></div>
    )
  }
}

// Graph component renders a visual representation of the generated JavaScript object
class Graph extends Component { 
  returnLampClass(power) {
    power = parseInt(power);
    let color = '';
    if (power == 0) {
      color = 'lamp-off';
    } else if (power > 0 && power <= 20) {
      color = 'lamp-low';
    } else if (power > 20 && power <= 40) {
      color = 'lamp-med-low';
    } else if (power > 40 && power <= 60) {
      color = 'lamp-medium';
    } else if (power > 60 && power <= 80) {
      color = 'lamp-med-high';
    } else if (power > 80 && power <= 90) {
      color = 'lamp-high';
    } else if (power > 90 && power <= 100) {
      color = 'lamp-sear';
    }

    return (
      color
    );
  }

  getStepWidth(value) {
    let width = 400;

    value.map((val) => {
      Object.entries(val).map(([condition, parameter]) => {
        if (parseInt(parameter)) {
          //console.log(parameter);
          width = parseInt(parameter * 10);
        }
      })
    })
    return width;
  }

  render() {
    const GRAPH_X_MOD = 2;
    const GRAPH_Y_MOD = 1;
 
    return (
      <div className='graph'>
        <div className='graph-inner'>
          {/* Render the steps */}
        {this.props.procedureObject.steps ?
          Object.entries(this.props.procedureObject.steps).map(([stepName, value]) => {
            return (
              <div className='graph-step' style={{width:this.getStepWidth(value.when)}} key={stepName}>
                <div className='graph-step-label'>step {stepName}: </div>
                {stepName ?
                Object.entries(value.when).map(([condition, val]) => {
                  // Render the exit condition(s)
                  return (
                  <div className='graph-step-exit' key={condition}>when {Object.entries(val).map(([key,parameter]) => {
                    return (
                      <span key={key}>
                        {key}{key==='timeSpent' ? '(' + stepName + ')' : ''} {key === 'timeSpent'||key === 'probeTemp' ? '>= ' :''}{parseInt(parameter) ? parameter : 'GOTO: ' + parameter} </span>
                      )
                    })
                  }</div>
                  )
                }) : <div></div> }
                {stepName ?
                Object.entries(value.heaters).map(([sequence, cycle]) => {
                  // Render the heater arrays
                  return (
                  <div class='graph-step-sequence' key={sequence}>{Object.entries(cycle).map(([position,intensity]) => {
                    return (
                      // Positions 1-5 = lamp power and position 6 = the cycle duration
                        <span style={{width:100/6*GRAPH_X_MOD,height:intensity*GRAPH_Y_MOD}} className={`bar ${this.returnLampClass(intensity)}`} key={position}>{position!=6 ? 
                          intensity
                         + ' ':''}
                          
                          {(intensity>0 && position==6) ? 'for ' + intensity: '' }
                          </span>
                      )
                    })
                  }</div>
                  )
                }) : <div></div> }
              </div>
            )
          }) :<div></div>
        }
        </div>
      </div>
    )
  }
}

// BravaScript component currently returns BravaScript from the generated JavaScript object
class BravaScript extends Component {
  // This function will convert an int seconds into XmYs format used in BravaScript
  formatTimeString(seconds) {
    var timeString = '';
    if (seconds / 60 > 1) {
      timeString = parseInt(seconds/60) + 'm' + seconds % 60 + 's';
    } else {
      timeString = seconds % 60 + 's';
    }
    return timeString;
  }
  
  render() {
    return (
      <div className='bravascript'><pre>
        {/* Render the parameters */}
        {this.props.procedureObject.params
        ? Object.entries(this.props.procedureObject.params).map(([label, variable]) =>
          <div key={label}>
            param {label} {variable}
          </div>) 
          
          :<div>Re-converted BravaScript from JSON output</div> 
        }
        <br/>
        {/* Render the steps */}
        {this.props.procedureObject.steps ?
          Object.entries(this.props.procedureObject.steps).map(([stepName, value]) => {
            return (
              <div key={stepName}>
                step {stepName}:
                {stepName ?
                Object.entries(value.when).map(([condition, val]) => {
                  // Render the exit condition(s)
                  return (
                  <div key={condition}>&nbsp;&nbsp;&nbsp;&nbsp;when {Object.entries(val).map(([key,parameter]) => {
                    return (
                      <span key={key}>
                        {key}{key==='timeSpent' ? '(' + stepName + ')' : ''} {key === 'timeSpent'||key === 'probeTemp' ? '>= ' :''}{parseInt(parameter) ? this.formatTimeString(parameter) : parameter} </span>
                      )
                    })
                  }</div>
                  )
                }) : <div></div> }
                {stepName ?
                Object.entries(value.heaters).map(([sequence, cycle]) => {
                  // Render the heater arrays
                  return (
                  <div key={sequence}>&nbsp;&nbsp;&nbsp;&nbsp;heater {Object.entries(cycle).map(([position,intensity]) => {
                    return (
                      // Positions 1-5 = lamp power and position 6 = the cycle duration
                      <span key={position}>{position!=6 ? intensity + ' ':''}{(intensity>0 && position==6) ? 'for ' + this.formatTimeString(intensity): '' }</span>
                      )
                    })
                  }</div>
                  )
                }) : <div></div> }
              </div>
            )
          }) :<div></div>
        }
      </pre></div>
    )
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: fetch(bravaScriptData).then(res => res.text()),
      parsed: 'JSON from Bravascript output',
      procedureObject: {}
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
    event.preventDefault();
    this.parseBravaScript(this.state.value);
  }

  getChild(index) { return index+1; }
  getGrandchild(index) { return index+2; }

  // Function to return int seconds from strings like 4m30s, 30s, 4m, etc.
  formatSeconds(timeString) {
    var seconds = 0;
    var timeArray = timeString.split(/[ms]/);
    var minFix = timeString.includes("m");

    timeArray[0] && timeArray[1] ? seconds = 
      parseInt(timeArray[0]) * 60 + parseInt(timeArray[1]) : 
      seconds = (minFix) ? parseInt(timeArray[0])*60 : parseInt(timeArray[0]);

    return seconds;
  }

  // Loops through submitted BravaScript as a large array, pulling out each section and reassembling into a JavaScript object, then finally returns valid JSON of the parsed script.
  parseBravaScript(code) {
    //console.log(code + '\n Parse operation complete');
    const processedArray = {};
    const params = {};
    const steps = {};
    let currentStep = '';
    let prevStep = '';
    
    // Regexes
    const stripSpaces = /"[^"]*"|\S+/gm; // Strips spaces
    code = code.replace(/:/g,''); // Strips colons

    let rawCodeArray = code.match(stripSpaces);
    //console.log(rawCodeArray);
    //this.setState({parsed: processedArray.join('\n')});
    var heaterArray = [];
    var whenArray = [];

    rawCodeArray.forEach((element, index) => {
      //console.log(`${element} at ${index}`);

      switch (element) {
        case 'param':
          // Retrieve parameters
          params[rawCodeArray[this.getChild(index)]] = rawCodeArray[this.getGrandchild(index)];
          break;

        case 'step':
          // Get the steps
          currentStep = rawCodeArray[this.getChild(index)];
          steps[currentStep] = {};

          if (prevStep !== currentStep) {
            whenArray = [];
            heaterArray = [];
          }
          
          break;

        case 'when':
          // Get the exit conditions
          var exitConditionParams = (this.formatSeconds(rawCodeArray[index+3])) ? 
              {timeSpent : (this.formatSeconds(rawCodeArray[index+3]))} : 
              {probeTemp : rawCodeArray[index+3]};

          exitConditionParams.then = rawCodeArray[index+5];

          whenArray.push(exitConditionParams);          
          steps[currentStep].when = whenArray;
          break;

        case 'then':
          // Get the exit step
          break;

        case 'heater':
          // Get the heater arrays
          var lampArray = [];

          if (rawCodeArray[index+1] !== "off") {
            lampArray = [
              parseInt(rawCodeArray[index+1]),
              parseInt(rawCodeArray[index+2]),
              parseInt(rawCodeArray[index+3]),
              parseInt(rawCodeArray[index+4]),
              parseInt(rawCodeArray[index+5]),
              parseInt(rawCodeArray[index+6]),
              parseInt(rawCodeArray[index+8].split('s',1)) ? parseInt(rawCodeArray[index+8].split('s',1)) : 0
            ];
          } else {
            lampArray = [0,0,0,0,0,0,
              parseInt(rawCodeArray[index+3].split('s',1)) ? parseInt(rawCodeArray[index+3].split('s',1)) : 0
            ]
          }

          heaterArray.push(lampArray);
          steps[currentStep].heaters = heaterArray;
          break;

        case 'for':
          // Get the heater timings
          break;

        default:
          break;
      }
      prevStep = currentStep;
      
    });

    processedArray.params = params;
    processedArray.steps = steps;
    
    // Convert the JS object into JSON, display the results
    var jsonString = JSON.stringify(processedArray, undefined, 4);
    var syntaxJsonString = this.syntaxHighlight(jsonString);
    this.setState({parsed: syntaxJsonString});
    this.setState({procedureObject: processedArray});
  }

  output(inp) {
    return (
      <pre>
        {inp}
      </pre>
    )
  }

  syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
  }

  render() {
    return (
      <div className="App">
        <form onSubmit={this.handleSubmit}>
          <label>
            BravaScript / JSON Converter:
          </label>
          <textarea 
            value={this.state.value}
            onChange={this.handleChange}
          />
          
          <button type="submit" value="Submit">Convert to JSON</button>
        </form> 
        
        <Graph procedureObject={this.state.procedureObject} />

        <div className='json'>
          <pre dangerouslySetInnerHTML={{ __html: this.state.parsed }}>
            
          </pre>
        </div>
        
        <BravaScript procedureObject={this.state.procedureObject} />
      </div>
    );
  }
}

export default App;