import React, { Component} from 'react'
import serializeForm from 'form-serialize'

export class ChangesetForm extends Component {
  state = {
    value: ''
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
        <p>Submit the hash of a changeset and we will fetch its code
          coverage information.</p>
        <form onSubmit={this.handleSubmit}>
          <label>Changeset:
            <input
              type='text'
              name='changeset'
              defaultValue={this.state.value}
              placeholder='changeset'
            />
            <button>Request code coverage data</button>
          </label>
        </form>
      </div>
    )
  }
}
