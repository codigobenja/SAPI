package com.sentiment.api.service;

import com.sentiment.api.dto.SentimentRequest;
import com.sentiment.api.dto.SentimentResponse;
import com.sentiment.api.model.Prediction;
import com.sentiment.api.repository.PredictionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.data.domain.Sort;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SentimentService {

    private final PredictionRepository predictionRepository;

    @Value("${ml.service.base-url}")
    private String mlServiceBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<Prediction> getAllPredictions() {
        return predictionRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public SentimentResponse analyzeSentiment(SentimentRequest request) {
        if (request.getText() == null || request.getText().trim().isEmpty()) {
            throw new IllegalArgumentException("El texto no puede estar vacío");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<SentimentRequest> entity = new HttpEntity<>(request, headers);

        String url = mlServiceBaseUrl + "/predict";
        SentimentResponse response = restTemplate.postForObject(url, entity, SentimentResponse.class);

        if (response != null) {
            Prediction prediction = new Prediction();
            prediction.setText(request.getText());
            prediction.setSentiment(response.getPrevision());
            prediction.setProbability(response.getProbabilidad());
            prediction.setModelVersion(response.getModelVersion());
            predictionRepository.save(prediction);
        }

        return response;
    }

    public List<SentimentResponse> analyzeSentimentBatch(com.sentiment.api.dto.BatchSentimentRequest batchRequest) {
        if (batchRequest.getTexts() == null || batchRequest.getTexts().isEmpty()) {
            throw new IllegalArgumentException("La lista de textos no puede estar vacía");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<com.sentiment.api.dto.BatchSentimentRequest> entity = new HttpEntity<>(batchRequest, headers);

        String url = mlServiceBaseUrl + "/predict/batch";
        com.sentiment.api.dto.BatchSentimentResponse response = restTemplate.postForObject(url, entity,
                com.sentiment.api.dto.BatchSentimentResponse.class);

        if (response != null && response.getResults() != null) {
            List<Prediction> predictions = new java.util.ArrayList<>();
            for (int i = 0; i < batchRequest.getTexts().size(); i++) {
                SentimentResponse res = response.getResults().get(i);
                Prediction p = new Prediction();
                p.setText(batchRequest.getTexts().get(i));
                p.setSentiment(res.getPrevision());
                p.setProbability(res.getProbabilidad());
                p.setModelVersion(res.getModelVersion());
                predictions.add(p);
            }
            predictionRepository.saveAll(predictions);
            return response.getResults();
        }

        return java.util.Collections.emptyList();
    }
}
