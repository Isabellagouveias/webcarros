import { FiTrash, FiUpload } from "react-icons/fi";
import { Container } from "../../../components/container/Container";
import { DashboardHeader } from "../../../components/dashboardHeader/dashboardHeader";
import { useForm } from "react-hook-form";
import { Input } from "../../../components/input/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useContext, useState, type ChangeEvent } from "react";
import { AuthContext } from "../../../contexts/authContext";
import { v4 as uuidv4 } from "uuid";
import { storage, db } from "../../../services/firebaseConnection";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import type { ImageItemProps } from "../../../interfaces/imageItemProps";
import { addDoc, collection } from "firebase/firestore";
import toast from "react-hot-toast";

const schema = z.object({
  name: z.string().nonempty("O nome é obrigatório"),
  model: z.string().nonempty("O modelo é obrigatório"),
  year: z.string().nonempty("O ano é obrigatório"),
  km: z.string().nonempty("O KM do carro é obrigatório"),
  price: z.string().nonempty("O preço é obrigatório"),
  city: z.string().nonempty("A cidade é obrigatória"),
  whatsapp: z
    .string()
    .min(1, "O telefone é obrigatório")
    .refine((value) => /^(\d{11,12})$/.test(value), "Número de telefone inválido"),
  description: z.string().nonempty("A descrição é obrigatória"),
});

type FormData = z.infer<typeof schema>;

export function New() {
  const { user } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const [carImages, setCarImages] = useState<ImageItemProps[]>([]);

  async function onSubmit(data: FormData) {
    if (carImages.length === 0) {
      toast.error("Envie ao menos uma imagem do carro.");
      return;
    }

    const carListImages = carImages.map((car) => ({
      name: car.name,
      url: car.url,
      uid: car.uid,
    }));

    const createPromise = addDoc(collection(db, "cars"), {
      name: data.name.toUpperCase(),
      model: data.model,
      whatsapp: data.whatsapp,
      city: data.city,
      year: data.year,
      km: data.km,
      price: data.price,
      description: data.description,
      created: new Date(),
      owner: user?.name,
      uid: user?.uid,
      images: carListImages,
    })
      .then(() => {
        reset();
        setCarImages([]);
      });

    await toast.promise(createPromise, {
      loading: "Cadastrando anúncio...",
      success: "Carro cadastrado com sucesso!",
      error: "Erro ao cadastrar o carro. Tente novamente.",
    });
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.files || !event.target.files[0]) return;

    const image = event.target.files[0];

    if (!(image.type === "image/jpeg" || image.type === "image/png")) {
      toast.error("Envie uma imagem do tipo PNG ou JPEG.");
      return;
    }

    await toast.promise(handleUpload(image), {
      loading: "Enviando imagem...",
      success: "Imagem enviada!",
      error: "Falha ao enviar a imagem.",
    });
  }

  async function handleUpload(image: File) {
    if (!user?.uid) throw new Error("Usuário não autenticado.");

    const currentUid = user.uid;
    const uidImage = uuidv4();
    const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`);

    const snapshot = await uploadBytes(uploadRef, image);
    const downloadURL = await getDownloadURL(snapshot.ref);

    const imageItem: ImageItemProps = {
      uid: currentUid,
      name: uidImage,
      url: downloadURL,
      previewUrl: URL.createObjectURL(image),
    };

    setCarImages((prev) => [...prev, imageItem]);
  }

  async function handleDeleteImage(item: ImageItemProps) {
    const imagePath = `images/${item.uid}/${item.name}`;
    const imageRef = ref(storage, imagePath);

    const deletePromise = deleteObject(imageRef).then(() => {
      setCarImages((prev) => prev.filter((car) => car.url !== item.url));
    });

    await toast.promise(deletePromise, {
      loading: "Removendo imagem...",
      success: "Imagem removida!",
      error: "Erro ao remover a imagem.",
    });
  }

  return (
    <Container>
      <DashboardHeader />

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
        <button className="border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
          <div className="absolute cursor-pointer">
            <FiUpload size={30} color="#000" />
          </div>
          <div className="cursor-pointer">
            <input type="file" accept="image/*" className="opacity-0 cursor-pointer" onChange={handleFile} />
          </div>
        </button>

        {carImages.map((item) => (
          <div key={item.name} className="w-full h-32 flex items-center justify-center relative">
            <button className="absolute" title="Excluir imagem" onClick={() => handleDeleteImage(item)}>
              <FiTrash size={28} color="#fff" />
            </button>
            <img src={item.previewUrl} className="rounded-lg w-full h-32 object-cover" alt="Foto do carro" />
          </div>
        ))}
      </div>

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row gap-2 mt-2">
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <p className="mb-2 font-medium">Nome do carro</p>
            <Input type="text" name="name" placeholder="Ex: Onix 1.0..." register={register} error={errors.name?.message} />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Modelo do carro</p>
            <Input type="text" name="model" placeholder="Ex: 1.0 Flex PLUS MANUAL..." register={register} error={errors.model?.message} />
          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Ano</p>
              <Input type="text" name="year" placeholder="Ex: 2016/2016..." register={register} error={errors.year?.message} />
            </div>

            <div className="w-full">
              <p className="mb-2 font-medium">KM rodados</p>
              <Input type="text" name="km" placeholder="Ex: 23.900..." register={register} error={errors.km?.message} />
            </div>
          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Telefone / Whatsapp</p>
              <Input type="text" name="whatsapp" placeholder="Ex: 011999101923..." register={register} error={errors.whatsapp?.message} />
            </div>

            <div className="w-full">
              <p className="mb-2 font-medium">Cidade</p>
              <Input type="text" name="city" placeholder="Ex: Campo Grande - MS..." register={register} error={errors.city?.message} />
            </div>
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Preço</p>
            <Input type="text" name="price" placeholder="Ex: 69.000..." register={register} error={errors.price?.message} />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Descrição</p>
            <textarea
              className="border-2 w-full rounded-md h-24 px-2"
              {...register("description")}
              name="description"
              id="description"
              placeholder="Digite a descrição completa sobre o carro..."
            />
            {errors.description && <span className="mb-1 text-red-500">{errors.description.message}</span>}
          </div>

          <button type="submit" className="w-full rounded-md bg-zinc-900 text-white font-medium h-10">
            Cadastrar
          </button>
        </form>
      </div>
    </Container>
  );
}
