package com.tripplanner.tripplanner.model;

import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class UserDTO {

    private Long id;

    @Size(max = 255)
    private String username;

    @Size(max = 255)
    private String email;

    private List<Long> trips;

}
