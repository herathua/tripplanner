# Use Amazon Corretto Java image
FROM amazoncorretto:21-alpine

# Set working directory
WORKDIR /app

# Copy the pre-built JAR file
COPY target/tripplanner-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "app.jar"]
