package it.unisa.c16.raduna;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PipelineSmokeController {

    @GetMapping(
            value = "/pipeline-smoke",
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String smoke() {
        return "Pipeline agentica OK";
    }
}
