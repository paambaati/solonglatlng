import { number, string, object } from 'prop-types';

const Spinner = (props) => {
  // Inspired by http://samherbert.net/svg-loaders/
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox={`0 0 ${props.size} ${props.size}`} stroke={props.color} style={props.style}>
      <g fill="none" fillRule="evenodd" transform="translate(1 1)" strokeWidth="2">
        <circle cx="22" cy="22" r="6" strokeOpacity="0">
          <animate attributeName="r"
            begin="1.5s" dur="3s"
            values="6;22"
            calcMode="linear"
            repeatCount="indefinite" />
          <animate attributeName="stroke-opacity"
            begin="1.5s" dur="3s"
            values="1;0" calcMode="linear"
            repeatCount="indefinite" />
          <animate attributeName="stroke-width"
            begin="1.5s" dur="3s"
            values="2;0" calcMode="linear"
            repeatCount="indefinite" />
        </circle>
        <circle cx="22" cy="22" r="6" strokeOpacity="0">
          <animate attributeName="r"
            begin="3s" dur="3s"
            values="6;22"
            calcMode="linear"
            repeatCount="indefinite" />
          <animate attributeName="stroke-opacity"
            begin="3s" dur="3s"
            values="1;0" calcMode="linear"
            repeatCount="indefinite" />
          <animate attributeName="stroke-width"
            begin="3s" dur="3s"
            values="2;0" calcMode="linear"
            repeatCount="indefinite" />
        </circle>
        <circle cx="22" cy="22" r="8">
          <animate attributeName="r"
            begin="0s" dur="1.5s"
            values="6;1;2;3;4;5;6"
            calcMode="linear"
            repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
}

Spinner.propTypes = {
  size: number,
  color: string,
  style: object,
};

Spinner.defaultProps = {
  size: 45,
  color: '#FFF', // Plain white.
  style: {},
};

export default Spinner;
