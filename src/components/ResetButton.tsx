import { ReactHTMLElement } from "react";

interface ResetProp {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function ResetButton({ onClick }: ResetProp) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick(e);
    e.currentTarget.blur();
  };

  return (
    <button type="button" className="btn btn-primary" onClick={handleClick}>
      Reset
    </button>
  );
}

export default ResetButton;
