import './TableMessage.css';

const TableMessage = ({ data, prompt }) => {
  return (
    <div className="table-message">
      <div className="table-container">
        <table className="selection-table">
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td className="table-label">{row.label}</td>
                <td className="table-value">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {prompt && <p className="table-prompt">{prompt}</p>}
    </div>
  );
};

export default TableMessage;
