/** @format */

import React, { useState, useContext } from "react";
import { css } from "@emotion/core";
import Router, { useRouter } from "next/router";
import FileUploader from "react-firebase-file-uploader";
import Layout from "../components/layout/Layout";
import { Formulario, Campo, InputSubmit, Error } from "../components/ui/Formulario";
import { FirebaseContext } from "../DataBase";
import Error404 from "../components/layout/404";
import useValidacion from "../hooks/useValidacion";
import validarCrearProducto from "../validacion/validarCrearProducto";

const STATE_INICIAL = {
	nombre: "",
	empresa: "",
	imagen: "",
	url: "",
	descripcion: "",
};

const ProductoNuevo = () => {
	// state de las imagenes
	const [nombreimagen, guardarNombre] = useState("");
	const [subiendo, guardarSubiendo] = useState(false);
	const [progreso, guardarProgreso] = useState(0);
	const [urlimagen, guardarUrlImagen] = useState("");

	const [error, guardarError] = useState(false);

	const { valores, errores, handleSubmit, handleChange, handleBlur } = useValidacion(
		STATE_INICIAL,
		validarCrearProducto,
		crearProducto
	);

	const {
		nombre,
		empresa,
		imagen,
		url,
		descripcion,
		Ingredientes,
		Preparacion,
		grasas,
		proteina,
		carbohidratos,
	} = valores;

	// hook de routing para redireccionar
	const router = useRouter();

	// context con las operaciones crud de DataBase
	const { usuario, DataBase } = useContext(FirebaseContext);

	async function crearProducto() {
		// si el usuario no esta autenticado llevar al login
		if (!usuario) {
			return router.push("/login");
		}

		// crear el objeto de nuevo producto
		const producto = {
			nombre,
			empresa,
			url,
			urlimagen,
			descripcion,
			Ingredientes,
			Preparacion,
			grasas,
			proteina,
			carbohidratos,
			votos: 0,
			comentarios: [],
			creado: Date.now(),
			creador: {
				id: usuario.uid,
				nombre: usuario.displayName,
			},
			haVotado: [],
		};

		// insertarlo en la base de datos
		DataBase.db.collection("productos").add(producto);

		return router.push("/");
	}

	const handleUploadStart = () => {
		guardarProgreso(0);
		guardarSubiendo(true);
	};

	const handleProgress = (progreso) => guardarProgreso({ progreso });

	const handleUploadError = (error) => {
		guardarSubiendo(error);
		console.error(error);
	};

	const handleUploadSuccess = (nombre) => {
		guardarProgreso(100);
		guardarSubiendo(false);
		guardarNombre(nombre);
		DataBase.storage
			.ref("productos")
			.child(nombre)
			.getDownloadURL()
			.then((url) => {
				console.log(url);
				guardarUrlImagen(url);
			});
	};

	return (
		<div>
			<Layout>
				{!usuario ? (
					<Error404 />
				) : (
					<>
						<h1
							css={css`
								text-align: center;
								margin-top: 5rem;
							`}
						>
							Nuevo Producto
						</h1>
						<Formulario onSubmit={handleSubmit} noValidate>
							<fieldset>
								<legend>Información General </legend>

								<Campo>
									<label htmlFor="nombre">Nombre</label>
									<input
										type="text"
										id="nombre"
										placeholder="Nombre del Producto"
										name="nombre"
										value={nombre}
										onChange={handleChange}
										onBlur={handleBlur}
									/>
								</Campo>

								{errores.nombre && <Error>{errores.nombre}</Error>}

								<Campo>
									<label htmlFor="empresa">Empresa</label>
									<input
										type="text"
										id="empresa"
										placeholder="Nombre Empresa o Compañia"
										name="empresa"
										value={empresa}
										onChange={handleChange}
										onBlur={handleBlur}
									/>
								</Campo>

								{errores.empresa && <Error>{errores.empresa}</Error>}

								<Campo>
									<label htmlFor="imagen">Imagen</label>
									<FileUploader
										accept="image/*"
										id="imagen"
										name="imagen"
										randomizeFilename
										storageRef={DataBase.storage.ref("productos")}
										onUploadStart={handleUploadStart}
										onUploadError={handleUploadError}
										onUploadSuccess={handleUploadSuccess}
										onProgress={handleProgress}
									/>
								</Campo>
								<Campo>
									<label htmlFor="url">URL</label>
									<input
										type="url"
										id="url"
										name="url"
										placeholder="URL de tu producto"
										value={url}
										onChange={handleChange}
										onBlur={handleBlur}
									/>
								</Campo>

								{errores.url && <Error>{errores.url}</Error>}
							</fieldset>

							<fieldset>
								<legend>Sobre tu Receta</legend>

								<Campo>
									<label htmlFor="descripcion">Descripción</label>
									<textarea
										id="descripcion"
										name="descripcion"
										value={descripcion}
										onChange={handleChange}
										onBlur={handleBlur}
									/>
								</Campo>
								{errores.descripcion && <Error>{errores.descripcion}</Error>}
								<Campo>
									<label htmlFor="Ingredientes">Ingredientes</label>
									<textarea
										id="Ingredientes"
										name="Ingredientes"
										value={Ingredientes}
										onChange={handleChange}
										onBlur={handleBlur}
									/>
								</Campo>

								<Campo>
									<label htmlFor="Preparacion">Preparación</label>
									<textarea
										id="Preparacion"
										name="Preparacion"
										value={Preparacion}
										onChange={handleChange}
										onBlur={handleBlur}
									/>
								</Campo>

								<Campo>
									<label htmlFor="grasas">% Grasas</label>
									<input
										id="grasas"
										name="grasas"
										value={grasas}
										onChange={handleChange}
										onBlur={handleBlur}
									/>
								</Campo>

								<Campo>
									<label htmlFor="proteina">% Proteína</label>
									<input
										id="proteina"
										name="proteina"
										value={proteina}
										onChange={handleChange}
										onBlur={handleBlur}
									/>
								</Campo>

								<Campo>
									<label htmlFor="carbohidratos">% Carbohidratos</label>
									<input
										id="carbohidratos"
										name="carbohidratos"
										value={carbohidratos}
										onChange={handleChange}
										onBlur={handleBlur}
									/>
								</Campo>
							</fieldset>

							{error && <Error>{error} </Error>}

							<InputSubmit type="submit" value="Crear Producto" />
						</Formulario>
					</>
				)}
			</Layout>
		</div>
	);
};

export default ProductoNuevo;
