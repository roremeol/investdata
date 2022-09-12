import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";

import styles from '../../styles/autocomplete.module.scss'

class Autocomplete extends Component {
  static propTypes = {
    suggestions: PropTypes.instanceOf(Array),
  };

  static defaultProps = {
    suggestions: []
  };

  constructor(props) {
    super(props);

    this.state = {
      // The active selection's index
      activeSuggestion: 0,
      // The suggestions that match the user's input
      filteredSuggestions: [],
      // Whether or not the suggestion list is shown
      showSuggestions: false,
      // What the user has entered
      userInput: ""
    };
  }

  onChange = e => {
    const { suggestions } = this.props;
    const userInput = e.currentTarget.value;

    // Filter our suggestions that don't contain the user's input
    const filteredSuggestions = suggestions.filter(
      suggestion =>
        suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
    );

    this.setState({      
      activeSuggestion: 0,
      filteredSuggestions,
      showSuggestions: true,
      userInput: e.currentTarget.value
    });
  };

  userDidSelect = (clickedSuggestion=-1) => {
    const { activeSuggestion, filteredSuggestions } = this.state;
    const { suggestions, onSelect=false } = this.props;

    if(!onSelect)
      return;

    const filteredSuggestionIndex = clickedSuggestion>-1 ? clickedSuggestion : activeSuggestion;    
    const index = suggestions.indexOf(filteredSuggestions[filteredSuggestionIndex]);

    onSelect({
      index,
      text:filteredSuggestions[filteredSuggestionIndex]
    });
  }

  onClick = e => {
    const activeSuggestion = e.currentTarget.getAttribute('data-index');

    this.userDidSelect(activeSuggestion);

    let userInput = e.currentTarget.innerText;
    if(!this.props.showSelectedText)
      userInput = '';

    this.setState({      
      activeSuggestion: 0,
      filteredSuggestions: [],
      showSuggestions: false,
      userInput
    });
  };

  onKeyDown = e => {
    const { activeSuggestion, filteredSuggestions } = this.state;

    // User pressed the enter key
    if (e.keyCode === 13) {
      this.userDidSelect();

      let userInput = filteredSuggestions[activeSuggestion];
      if(!this.props.showSelectedText)
        userInput = '';
      
      this.setState({
        
        activeSuggestion: 0,
        showSuggestions: false,
        userInput
      });
    }
    // User pressed the up arrow
    else if (e.keyCode === 38) {
      if (activeSuggestion === 0) {
        return;
      }

      this.setState({ activeSuggestion: activeSuggestion - 1 });
    }
    // User pressed the down arrow
    else if (e.keyCode === 40) {
      if (activeSuggestion - 1 === filteredSuggestions.length) {
        return;
      }

      if(activeSuggestion < filteredSuggestions.length-1)
        this.setState({ activeSuggestion: activeSuggestion + 1 });
    }
  };

  onKeyUp = e => {
    const userInput = e.currentTarget;

    // User pressed the up arrow, put de cursor on end
    if (e.keyCode === 38) {
      const end = userInput.value.length;

      userInput.setSelectionRange(end, end);
      userInput.focus();
    }
  };

  render() {
    const {
      onChange,
      onClick,
      onKeyDown,
      onKeyUp,
      state: {
        activeSuggestion,
        filteredSuggestions,
        showSuggestions,
        userInput,
      },
    } = this;

    let suggestionsListComponent;

    if (showSuggestions && userInput) {
      if (filteredSuggestions.length) {
        suggestionsListComponent = (
          <ul className={styles.suggestions}>
            {filteredSuggestions.map((suggestion, index) => {
              let className;

              // Flag the active suggestion with a class
              if (index === activeSuggestion) {
                className = styles['suggestion-active'];
              }

              return (
                <li className={className} key={suggestion} data-index={index} onClick={onClick}>
                  {/* {suggestion} */}
                  <div dangerouslySetInnerHTML={{ __html: suggestion }} />
                </li>
              );
            })}
          </ul>
        );
      } else {
        suggestionsListComponent = (
          <div className={styles['no-suggestions']}>
            <em>No suggestions, you're on your own!</em>
          </div>
        );
      }
    }

    return (
      <Fragment>
        <input
          type="text"
          onChange={onChange}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          value={userInput}
          className={this.props.class ? this.props.class : ''}
          placeholder={this.props.placeholder ? this.props.placeholder : ''}
        />
        {suggestionsListComponent}
      </Fragment>
    );
  }
}

export default Autocomplete;
