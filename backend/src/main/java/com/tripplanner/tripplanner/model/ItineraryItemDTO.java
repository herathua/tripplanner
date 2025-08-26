package com.tripplanner.tripplanner.model;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class ItineraryItemDTO {

    private Long id;

    private Integer dayNumber;

    @Size(max = 255)
    private String title;

    @Size(max = 255)
    private String description;

    @Size(max = 255)
    private String location;

    private Long trip;

}
