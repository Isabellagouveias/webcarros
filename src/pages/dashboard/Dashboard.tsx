import { FiTrash2 } from "react-icons/fi";
import { Container } from "../../components/container/Container";
import { DashboardHeader } from "../../components/dashboardHeader/dashboardHeader";
import { useContext, useEffect, useState } from "react";
import { collection, getDocs, where, query, doc, deleteDoc } from "firebase/firestore";
import { db, storage } from "../../services/firebaseConnection";
import { ref, deleteObject } from "firebase/storage";
import type { CarProps } from "../../interfaces/carProps";
import { AuthContext } from "../../contexts/authContext";
import toast from "react-hot-toast";

export function Dashboard() {
  const [cars, setCars] = useState<CarProps[]>([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    async function loadCars() {
      if (!user?.uid) return;

      try {
        const carsRef = collection(db, "cars");
        const queryRef = query(carsRef, where("uid", "==", user.uid));
        const snapshot = await getDocs(queryRef);

        const listCars: CarProps[] = [];

        snapshot.forEach((docu) => {
          listCars.push({
            id: docu.id,
            name: docu.data().name,
            year: docu.data().year,
            uid: docu.data().uid,
            price: docu.data().price,
            city: docu.data().city,
            km: docu.data().km,
            images: docu.data().images,
          });
        });

        setCars(listCars);
      } catch (error) {
        console.error("Erro ao carregar os carros:", error);
        toast.error("Não foi possível carregar seus carros. Tente novamente.");
      }
    }

    loadCars();
  }, [user]);

  async function handleDeleteCar(car: CarProps) {

    const execDelete = async () => {
      const docRef = doc(db, "cars", car.id);
      await deleteDoc(docRef);

      // Deleta todas as imagens vinculadas
      await Promise.all(
        (car.images || []).map(async (image) => {
          const imagePath = `images/${car.uid}/${image.name}`;
          const imageRef = ref(storage, imagePath);
          await deleteObject(imageRef);
        })
      );

      // Atualiza estado local
      setCars((prev) => prev.filter((c) => c.id !== car.id));
    };

    await toast.promise(execDelete(), {
      loading: "Excluindo anúncio...",
      success: "Anúncio excluído com sucesso!",
      error: "Falha ao excluir o anúncio. Tente novamente.",
    });
  }

  return (
    <Container>
      <DashboardHeader />

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
        {cars.map((car) => (
          <section key={car.id} className="w-full bg-white rounded-lg relative">
            <button
              className="absolute bg-white w-14 h-14 rounded-full flex items-center justify-center right-2 top-2 drop-shadow"
              onClick={() => handleDeleteCar(car)}
              title="Excluir anúncio"
            >
              <FiTrash2 size={26} color="#000" />
            </button>

            <img
              className="w-full rounded-lg mb-2 max-h-70 object-cover"
              src={car.images[0]?.url || ""}
              alt={car.name}
            />

            <p className="font-bold mt-1 px-2 mb-1">{car.name}</p>

            <div className="flex flex-col px-2">
              <span className="text-zinc-700">
                Ano {car.year} | {car.km} km
              </span>
              <strong className="text-black font-bold mt-4">R$ {car.price}</strong>
            </div>

            <div className="w-full h-px bg-slate-200 my-2"></div>
            <div className="px-2 pb-2">
              <span className="text-black">{car.city}</span>
            </div>
          </section>
        ))}
      </main>
    </Container>
  );
}
