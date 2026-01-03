package com.sentiment.api.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "predictions")
@Data
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String text;

    @Column(nullable = false)
    private String sentiment;

    @Column(nullable = false)
    private Double probability;

    @Column(name = "model_version", length = 50)
    private String modelVersion;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
