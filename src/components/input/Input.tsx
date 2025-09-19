import type { InputProps } from '../../interfaces/inputProps';

export function Input({ type, placeholder, name, register, rules, error }: InputProps) {
  return (
    <div>
      <input
        className="w-full border-2 rounded-md h-11 px-2"
        placeholder={placeholder}
        type={type}
        {...register(name, rules)}
        id={name}
      />
      {error && <span className="text-red-500">{error}</span>}
    </div>
  );
}
