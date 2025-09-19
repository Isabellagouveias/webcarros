import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import logoImage from '../../assets/logo.svg';
import { Container } from '../../components/container/Container';
import { Input } from '../../components/input/Input';
import { createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../../services/firebaseConnection';
import { AuthContext } from '../../contexts/authContext';
import { useEffect, useContext } from 'react';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().nonempty('O nome é obrigatório'),
  email: z.string().email('Insira um e-mail válido').nonempty('O e-mail é obrigatório'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres').nonempty('A senha é obrigatória'),
});

type FormData = z.infer<typeof schema>;

export function Register() {
  const { handleInfoUser } = useContext(AuthContext);

  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  useEffect(() => {
    async function handleLogout() {
      await signOut(auth);
    }

    handleLogout();
  })

  function onSubmit(data: FormData) {
    createUserWithEmailAndPassword(auth, data.email, data.password)
      .then(async (userCredential) => {
        await updateProfile(userCredential.user, {
          displayName: data.name
        });

        // Registro bem-sucedido
        handleInfoUser({ name: data.name, email: data.email, uid: userCredential.user.uid });
        toast.success("Cadastro realizado com sucesso!");
        navigate("/dashboard", { replace: true });
      })
      .catch(() => {
        toast.error("Erro ao cadastrar, tente novamente.");
      });
  }

  return (
    <Container>
      <div className="w-full min-h-screen flex justify-center items-center flex-col gap-4">
        <Link to="/" className="mb-6 max-w-sm w-full">
          <img src={logoImage} alt="Logo do site" className="w-full" />
        </Link>

        <form className="bg-white max-w-xl w-full rounded-lg p-6" onSubmit={handleSubmit(onSubmit)}>

          <div className="mb-3">
            <Input
              type="text"
              placeholder="Digite o seu nome completo"
              name="name"
              error={errors.name?.message}
              register={register}
            />
          </div>

          <div className="mb-3">
            <Input
              type="email"
              placeholder="Digite o seu e-mail"
              name="email"
              error={errors.email?.message}
              register={register}
            />
          </div>

          <div className="mb-3">
            <Input
              type="password"
              placeholder="Digite a sua senha"
              name="password"
              error={errors.password?.message}
              register={register}
            />
          </div>

          <button
            type="submit"
            className="bg-zinc-900 w-full rounded-md text-white h-10 font-medium"
          >
            Cadastrar
          </button>
        </form>

        <Link to="/login">Já possui uma conta? Faça o login!</Link>
      </div>
    </Container>
  );
}
