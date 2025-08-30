package com.tripplanner.tripplanner.model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class TripDTO {

    private Long id;

    @NotNull
    @Size(max = 255)
    private String title;

    @Size(max = 255)
    private String destination;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private String endDate;

    private Double budget;

    private List<Long> user;

    private List<Long> itineraryItems;

}