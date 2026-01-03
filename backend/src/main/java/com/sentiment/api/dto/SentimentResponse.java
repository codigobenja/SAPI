package com.sentiment.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SentimentResponse {
    private String prevision;
    private Double probabilidad;
    @JsonProperty("model_version")
    private String modelVersion;
}
