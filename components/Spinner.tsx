const Spinner = (props) => {
  return (
    <div>
      <style jsx>{`
        .animation {
          display: inline-block;
        }
        .animation .frame {
          top: 0;
          left: 0;
          animation-timing-function: linear;
          position: absolute;
          animation-name: fade;
          animation-duration: .7s;
          animation-iteration-count: infinite;
        }
        
        .animation--f3 .frame:nth-child(2) {
          animation-delay: .25s;   
        }
        .animation--f3 .frame:nth-child(1) {
          animation-delay: .5s;  
        }
        
        .animation--f8 .frame:nth-child(8) {
          animation-delay: .8s
        }
        .animation--f8 .frame:nth-child(7) {
          animation-delay: .7s
        }
        .animation--f8 .frame:nth-child(6) {
          animation-delay: .6s
        }
        .animation--f8 .frame:nth-child(5) {
          animation-delay: .5s
        }
        .animation--f8 .frame:nth-child(4) {
          animation-delay: .4s
        }
        .animation--f8 .frame:nth-child(3) {
          animation-delay: .3s
        }
        .animation--f8 .frame:nth-child(2) {
          animation-delay: .2s
        }
        .animation--f8 .frame:nth-child(1) {
          animation-delay: .1s
        }
        @keyframes fade {
          33% { 
            opacity: 1;
            z-index: 1;
          }
         66% { 
            opacity: 0;
            z-index: 0;
          }
        }
      `}
      </style>
      <figure className="animation animation--f8 flex-1 float-left pl-3 text-3xl">
        <span className="frame pt-1 pl-3">🌖</span>
        <span className="frame pt-1 pl-3">🌗</span>
        <span className="frame pt-1 pl-3">🌘</span>
        <span className="frame pt-1 pl-3">🌑</span>
        <span className="frame pt-1 pl-3">🌒</span>
        <span className="frame pt-1 pl-3">🌓</span>
        <span className="frame pt-1 pl-3">🌔</span>
        <span className="frame pt-1 pl-3">🌕</span>
      </figure>

    </div>
  );
}

export default Spinner;
