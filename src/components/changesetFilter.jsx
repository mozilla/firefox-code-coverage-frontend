import FilterIcon from 'mdi-react/FilterIcon';
import CloseCircleIcon from 'mdi-react/CloseCircleIcon';

const changesetFilter = ({ value, onChange }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
    <form style={{ margin: '0em 0em 1em 3.5em' }} className={!value ? 'empty' : ''}>
      <span>Filter by description:&nbsp;</span>
      <input
        id="descriptionFilterField"
        type="text"
        value={value}
        onChange={event => onChange(event)}
      />
      <button
        style={{ height: '2em' }}
        onClick={(event) => {
          document.getElementById('descriptionFilterField').value = '';
          onChange(event);
        }}
      >
        <CloseCircleIcon />
      </button>
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
