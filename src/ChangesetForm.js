import React, { Component} from 'react'
import serializeForm from 'form-serialize'

export class ChangesetForm extends Component {
  state = {
    value: ''
  }

  constructor(props) {
    super(props)
    this.state = {value: props.initialValue}
  }

  onChange = (e) => {
    // XXX: When I paste a changeset I get this error:
    // TypeError: Cannot read property 'target' of undefined
    if (!e.value) {
      debugger;
    }
    debugger;
    //this.setState({value: e.value.target})
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const changeset = serializeForm(e.target, { 'hash': true })
    if (this.props.onSubmit) {
      this.props.onSubmit(changeset)
    } else {
      console.log('No handler was provided.')
    }
  }

  render() {
    return (
      <div>
        <p>DISCLAIMER: The only changeset with some hard-coded code coverage
          data is 12e33b9d6f91.</p>
        <p>Submit the hash of a changeset and we will fetch its code
          coverage information.</p>
        <form onSubmit={this.handleSubmit}>
          <label>Changeset:
            <input
              type='text'
              name='changeset'
              defaultValue={this.state.value}
              // onChange={this.onChange}
              placeholder='changeset'
            />
            <button>Request code coverage data</button>
          </label>
        </form>
      </div>
    )
  }
}
