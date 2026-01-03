package com.sentiment.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SentimentApplication {

	public static void main(String[] args) {
		// Cargar variables desde el archivo .env en la raíz del proyecto
		try {
			io.github.cdimascio.dotenv.Dotenv dotenv = io.github.cdimascio.dotenv.Dotenv.configure()
					.directory("..") // El archivo .env está en la raíz, un nivel arriba de /backend
					.ignoreIfMissing()
					.load();

			dotenv.entries().forEach(e -> System.setProperty(e.getKey(), e.getValue()));
		} catch (Exception e) {
			System.out.println("Nota: No se encontró archivo .env o hubo un error al leerlo.");
		}

		SpringApplication app = new SpringApplication(SentimentApplication.class);

		// Lógica automática: Si hay contraseña en .env/sistema, usamos Supabase
		String dbPassword = System.getProperty("DB_PASSWORD");
		if (dbPassword == null)
			dbPassword = System.getenv("DB_PASSWORD");

		if (dbPassword != null && !dbPassword.trim().isEmpty()) {
			System.out.println(">>> Credenciales detectadas: Activando SUPABASE (Producción).");
			app.setAdditionalProfiles("supabase");
		} else {
			System.out.println(">>> Sin credenciales: Activando H2 en MEMORIA (Pruebas).");
		}

		app.run(args);
	}

}
