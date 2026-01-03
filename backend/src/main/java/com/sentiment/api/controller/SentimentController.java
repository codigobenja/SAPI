package com.sentiment.api.controller;

import com.sentiment.api.dto.SentimentRequest;
import com.sentiment.api.dto.SentimentResponse;
import com.sentiment.api.model.Prediction;
import com.sentiment.api.service.SentimentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SentimentController {

    private final SentimentService sentimentService;

    @GetMapping("/history")
    public ResponseEntity<List<Prediction>> getHistory() {
        return ResponseEntity.ok(sentimentService.getAllPredictions());
    }

    @PostMapping("/sentiment")
    public ResponseEntity<?> predict(@RequestBody SentimentRequest request) {
        try {
            SentimentResponse response = sentimentService.analyzeSentiment(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno del servidor: " + e.getMessage());
        }
    }

    @PostMapping("/sentiment/batch")
    public ResponseEntity<?> predictBatch(@RequestBody com.sentiment.api.dto.BatchSentimentRequest request) {
        try {
            List<SentimentResponse> responses = sentimentService.analyzeSentimentBatch(request);
            return ResponseEntity.ok(responses);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno del servidor: " + e.getMessage());
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Backend is running!");
    }
}
