'use client';
import { pt } from './pingText';
import React from 'react';
export class PlayerSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            error: '',
        };
    }
    isUuid(input) {
        const uuidWithDashes = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const uuidWithoutDashes = /^[0-9a-f]{32}$/i;
        return uuidWithDashes.test(input) || uuidWithoutDashes.test(input);
    }
    validateUsername(username) {
        if (!username.trim()) {
            this.setState({ error: pt('enterPlayer') });
            return false;
        }
        if (this.isUuid(username)) {
            this.setState({ error: '' });
            return true;
        }
        const pattern = /^[a-zA-Z0-9_]{3,16}$/;
        if (!pattern.test(username)) {
            this.setState({ error: pt('badPlayer') });
            return false;
        }
        this.setState({ error: '' });
        return true;
    }
    handleSubmit = (e) => {
        e.preventDefault();
        const { username } = this.state;
        if (this.validateUsername(username)) {
            this.props.onSearch(username);
        }
    };
    handleChange = (e) => {
        this.setState({ username: e.target.value });
        if (this.state.error) {
            this.setState({ error: '' });
        }
    };
    render() {
        const { username, error } = this.state;
        const { loading } = this.props;
        return (<div className="player-search-container">
        <h2 className="section-title">{pt('playerTitle')}</h2>
        <p className="section-hint">
          {pt('playerHint')}
        </p>
        <form onSubmit={this.handleSubmit} className="search-form">
          <input type="text" value={username} onChange={this.handleChange} placeholder={pt('playerPlaceholder')} className={`search-input player-search-input ${error ? 'error' : ''}`} disabled={loading}/>
          <button type="submit" className="btn btn-search" disabled={loading}>
            {pt('search')}
          </button>
          {error && <span className="error-message">{error}</span>}
        </form>
      </div>);
    }
}
