import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { CarProps } from "../../interfaces/carProps";
import { doc, getDoc } from "firebase/firestore";
import { Container } from "../../components/container/Container";
import { db } from "../../services/firebaseConnection";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { FaWhatsapp } from "react-icons/fa";

export function CarDetail() {
  const { id } = useParams();
  const [car, setCar] = useState<CarProps>();
  const [slidesPerView, setSlidesPerView] = useState<number>(2);
  const navigate = useNavigate();

  useEffect(() => {
    function loadCar() {
      if (!id) return;

      const docRef = doc(db, "cars", id);
      getDoc(docRef)
        .then((snapshot) => {
          if (!snapshot.exists()) {
            navigate("/");
            return;
          }

          const data = snapshot.data();
          setCar({
            id: snapshot.id,
            name: data?.name,
            year: data?.year,
            city: data?.city,
            model: data?.model,
            uid: data?.uid,
            description: data?.description,
            created: data?.created,
            whatsapp: data?.whatsapp,
            price: data?.price,
            km: data?.km,
            owner: data?.owner,
            images: data?.images,
          });
        })
        .catch((error) => {
          console.error("Erro ao carregar carro:", error);
        });
    }

    loadCar();
  }, [id, navigate]);

  useEffect(() => {
    function handleResize() {
      setSlidesPerView(window.innerWidth < 720 ? 1 : 2);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const waLink =
    car
      ? `https://wa.me/${car.whatsapp}?text=${encodeURIComponent(
        `Olá, vi esse ${car.name} e fiquei interessado.`
      )}`
      : "#";

  return (
    <Container>
      {car && (
        <Swiper
          slidesPerView={slidesPerView}
          pagination={{ clickable: true }}
          navigation
          modules={[Navigation, Pagination]}
        >
          {(car.images ?? []).map((image) => (
            <SwiperSlide key={image.uid}>
              <img src={image.url} alt={image.name} className="w-full h-96 object-cover" />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {car && (
        <main className="w-full bg-white rounded-lg p-6 my-4">
          <div className="flex flex-col sm:flex-row mb-4 items-center justify-between">
            <h1 className="font-bold text-3xl text-black">{car.name}</h1>
            <h1 className="font-bold text-3xl text-black">R$ {car.price}</h1>
          </div>

          <p>{car.model}</p>

          <div className="flex w-full gap-6 my-4">
            <div className="flex flex-col gap-4">
              <div>
                <p>Cidade</p>
                <strong>{car.city}</strong>
              </div>
              <div>
                <p>Ano</p>
                <strong>{car.year}</strong>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <p>KM</p>
                <strong>{car.km}</strong>
              </div>
            </div>
          </div>

          <strong>Descrição</strong>
          <p className="mb-4">{car.description}</p>

          <strong>Telefone / Whatsapp</strong>
          <p>{car.whatsapp}</p>

          <a
            className="bg-green-500 w-full text-white flex items-center justify-center gap-2 my-6 h-11 text-xl rounded-lg font-medium cursor-pointer"
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Conversar com o vendedor
            <FaWhatsapp size={26} color="#fff" />
          </a>
        </main>
      )}
    </Container>
  );
}
