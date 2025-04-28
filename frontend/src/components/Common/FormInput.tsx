interface InputProps {
  type:
    | "text"
    | "email"
    | "url"
    | "number"
    | "tel"
    | "data"
    | "range"
    | "password";
  width: number;
  height: number;
  name: string;
  className?: string;
  label?: string;
  require?: boolean;
  placeholder?: string;
}

function Input({
  type,
  name,
  className,
  label,
  require,
  width,
  height,
  placeholder,
}: InputProps) {
  return (
    <>
      {label && (
        <>
          <label htmlFor=""></label>
          <div className="text-foreground mb-1">
            {label} {require && <span className="text-destructive">*</span>}
          </div>
        </>
      )}

      <input
        type={type}
        name={name}
        required={require === true}
        placeholder={placeholder}
        className={`w-${width} h-${height} border-2 px-3 py-2 rounded-md outline-none not-placeholder-shown:invalid:ring not-placeholder-shown:invalid:border-none not-placeholder-shown:invalid:ring-destructive focus:ring-2 focus:ring-accent focus:border-none focus:invalid:ring-destructive focus:invalid:ring-2 `}
      />
    </>
  );
}

export default Input;
