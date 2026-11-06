'use client';
import React from 'react';
import { PortValidator } from './PortValidator';
export class ServerInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            address: props.initialValue || '',
            error: '',
        };
    }
    componentDidUpdate(prevProps) {
        if (prevProps.initialValue !== this.props.initialValue && this.props.initialValue) {
            this.setState({ address: this.props.initialValue });
        }
    }
    validateAddress(address) {
        if (!address.trim()) {
            this.setState({ error: 'Введите адрес сервера' });
            return false;
        }
        const pattern = /^[a-zA-Z0-9.-]+(\:[0-9]{1,5})?$/;
        if (!pattern.test(address)) {
            this.setState({ error: 'Неверный формат адреса' });
            return false;
        }
        const parsed = PortValidator.parseAddress(address);
        if (!parsed.valid) {
            this.setState({ error: parsed.error });
            return false;
        }
        this.setState({ error: '' });
        return true;
    }
    handleSubmit = (e) => {
        e.preventDefault();
        const { address } = this.state;
        if (this.validateAddress(address)) {
            this.props.onSearch(address);
        }
    };
    handleChange = (e) => {
        this.setState({ address: e.target.value });
        if (this.state.error) {
            this.setState({ error: '' });
        }
    };
    render() {
        const { address, error } = this.state;
        const { loading } = this.props;
        return (<div className="search-container">
        <form onSubmit={this.handleSubmit} className="search-form">
          <input type="text" value={address} onChange={this.handleChange} placeholder="Адрес сервера" className={`search-input ${error ? 'error' : ''}`} disabled={loading}/>
          <button type="submit" className="btn btn-search" disabled={loading}>
            Искать
          </button>
          {error && <span className="error-message">{error}</span>}
        </form>
      </div>);
    }
}
