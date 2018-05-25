import FilterIcon from 'mdi-react/FilterIcon';

const changesetFilter = ({ value, onChange }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
    <form style={{ margin: '0em 0em 1em 3.5em' }}>
      <span>Filter by description:&nbsp;</span>
      <input
        id="descriptionFilterField"
        type="text"
        value={value}
        onChange={event => onChange(event)}
        onBlur={(event) => {
          document.getElementById('descriptionFilterField').value = '';
          onChange(event);
        }}
      />
    </form>
    <button
      style={{ height: '2em' }}
      onClick={() => {
        document.getElementById('descriptionFilterField').focus();
      }}
    >
      <FilterIcon />
    </button>
  </div>
);

export default changesetFilter;
