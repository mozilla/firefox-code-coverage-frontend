import React, { Component } from 'react';
import * as FetchAPI from './fetch_data'

var parse = require('parse-diff');

function Change(props) {
  var type = props.change.type
  var css_class

  if (type === 'add') {
    css_class = 'difflineplus'
  } else if (type === 'del') {
    css_class = 'difflineminus'
  } else {
    css_class = 'difflinenormal'
  }
  // We need to use Template literal expression to put span tags in new lines
  // since we're rendering within a pre tag
  // XXX: See if we're using key properly or not
  return (<span key={props.index} className={css_class}>{`${props.change.content}
`}</span>);
}

function Chunk(props) {
  return (
    <div className='chunk'>
      <span className='difflineat'>{`${props.block.content}
`}</span>
      {props.block.changes.map((change, index) => {
         return <Change key={index} change={change} />;
       })}
    </div>
  );
}

/* A DiffBlock is all the changes to a specific file */
function DiffBlock(props) {
  // diff_block.from and diff_block.to can show if a file has been renamed
  /* The template literal expression on the first span is to make it wrap
   * properly on Firefox */
  return (
    <div className='diffblock'>
      <pre className='sourcelines'>
        <span className='difflineminus'>{`${'--- a/'+props.diff_block.from}
`}</span>
        <span className='difflineplus'>{'--- b/'+props.diff_block.to}</span>
        {props.diff_block.chunks.map((block, index) =>
          <Chunk key={index} block={block} />
        )}
      </pre>
    </div>
  );
}

/* DiffViewer loads a raw diff from Mozilla's hg-web and code coverage from
 * shiptit-uplift and shows a diff with code coverage information for added
 * lines.
 */
class DiffViewer extends Component {
  state = {
    parsed_changeset: []
  }

  componentDidMount() {
    FetchAPI.getDiff(this.props.changeset).then(response =>
      response.text()
    ).then(text =>
      this.setState({parsed_changeset: parse(text)})
    ).catch(error =>
      console.log(error))
  }

  render() {
    return (
      <div className="page_body diffblocks">
        {this.state.parsed_changeset.map((diff_block, index) =>
          <DiffBlock key={index} diff_block={diff_block} />)}
      </div>
    );
  }
}

// Main component
export function CodeCoverageDiffViewer(props) {
  return (
      <div className="page_body codecoverage-diffviewer">
        <DiffViewer changeset={props.changeset}/>
      </div>
  );
}
