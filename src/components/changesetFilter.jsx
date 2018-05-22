const changesetFilter = ({ value, onChange }) => (
  <form style={{ margin: '0em 0em 1em 3.5em' }}>
    <span>Filter by description:&nbsp;</span>
    <input
      type="text"
      value={value}
      onChange={event => onChange(event)}
    />
  </form>
);

export default changesetFilter;
